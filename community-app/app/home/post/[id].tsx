import { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import { db, auth } from "../../_utils/firebase";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  writeBatch,
  getDocs,
} from "firebase/firestore";
import { useLocalSearchParams, router } from "expo-router";

const toIdString = (v: unknown) =>
  Array.isArray(v) ? v[0] ?? "" : (v as string) ?? "";

type PostData = {
  id?: string;
  title?: string;
  content?: string;
  imageBase64?: string | null;
  authorId?: string | null;
  authorNickname?: string;
  createdAt?: { seconds: number; nanoseconds: number } | any;
};

export default function PostDetail() {
  const params = useLocalSearchParams();
  const routeId = toIdString(params.id);

  const [post, setPost] = useState<PostData | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");

  const isOwner = useMemo(
    () => !!auth.currentUser && post?.authorId === auth.currentUser.uid,
    [post?.authorId]
  );

  useEffect(() => {
    if (!routeId) return;

    const fetchPost = async () => {
      try {
        const postRef = doc(db, "posts", routeId);
        const snap = await getDoc(postRef);
        if (!snap.exists()) return Alert.alert("게시글을 찾을 수 없습니다.");

        const data = snap.data() as PostData;
        let authorNickname = data.authorNickname ?? "익명";
        if (!data.authorNickname && data.authorId) {
          const userSnap = await getDoc(doc(db, "users", data.authorId));
          authorNickname = userSnap.exists()
            ? (userSnap.data() as any)?.nickname || "익명"
            : "익명";
        }

        setPost({ id: snap.id, ...data, authorNickname });
        console.log("[POST LOADED]", {
          routeId,
          docId: snap.id,
          authorId: data.authorId,
        });
      } catch (e: any) {
        console.log("Fetch post error:", e);
        Alert.alert("게시글 불러오기 실패", e.message);
      }
    };

    fetchPost();

    const q = query(
      collection(db, "posts", routeId, "comments"),
      orderBy("createdAt", "asc")
    );
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const list = await Promise.all(
        snapshot.docs.map(async (d) => {
          const c = d.data();
          let nickname = "익명";
          if (c.authorId) {
            const userSnap = await getDoc(doc(db, "users", c.authorId));
            nickname = userSnap.exists()
              ? (userSnap.data() as any)?.nickname || "익명"
              : "익명";
          }
          return { id: d.id, ...c, nickname };
        })
      );
      setComments(list);
    });

    return () => unsubscribe();
  }, [routeId]);

  const handleAddComment = async () => {
    if (!auth.currentUser) return Alert.alert("로그인이 필요합니다.");
    if (!commentText) return Alert.alert("댓글 내용을 입력하세요.");
    if (!routeId) return Alert.alert("게시글 ID가 없습니다.");

    try {
      await addDoc(collection(db, "posts", routeId, "comments"), {
        text: commentText,
        authorId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });
      setCommentText("");
    } catch (error: any) {
      Alert.alert("댓글 등록 실패", error.message);
    }
  };

  const deletePostWithComments = async (postId: string) => {
    const batch = writeBatch(db);
    try {
      const commentsRef = collection(db, "posts", postId, "comments");
      const commentsSnap = await getDocs(commentsRef);
      commentsSnap.forEach((c) => {
        batch.delete(doc(db, "posts", postId, "comments", c.id));
      });
      batch.delete(doc(db, "posts", postId));
      await batch.commit();
    } catch (error: any) {
      throw error;
    }
  };

  const handleDeletePost = async () => {
    console.log("삭제 함수 실행됨");
    console.log("현재 사용자:", auth.currentUser?.uid);
    console.log("작성자:", post?.authorId);
    console.log("isOwner:", isOwner);

    if (!isOwner) {
      if (Platform.OS === "web") {
        window.alert("삭제 권한이 없습니다.");
      } else {
        Alert.alert("삭제 권한이 없습니다.");
      }
      return;
    }

    const postId = post?.id ?? routeId;
    if (!postId) {
      if (Platform.OS === "web") {
        window.alert("게시글 ID가 유효하지 않습니다.");
      } else {
        Alert.alert("게시글 ID가 유효하지 않습니다.");
      }
      return;
    }

    if (Platform.OS === "web") {
      const confirmed = window.confirm("정말 삭제하시겠습니까?");
      if (!confirmed) return;
      try {
        await deletePostWithComments(postId);
        window.alert("게시글이 삭제되었습니다.");
        router.replace("/home");
      } catch (error: any) {
        window.alert("삭제 실패: " + (error?.message ?? "알 수 없는 오류"));
      }
    } else {
      Alert.alert("게시글 삭제", "정말 삭제하시겠습니까?", [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePostWithComments(postId);
              Alert.alert("게시글이 삭제되었습니다.");
              router.replace("/home");
            } catch (error: any) {
              Alert.alert("삭제 실패", error?.message ?? "알 수 없는 오류");
            }
          },
        },
      ]);
    }
  };

  if (!post) return <Text style={{ padding: 20 }}>불러오는 중...</Text>;

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={{ height: 80 }} />
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>← 뒤로가기</Text>
      </TouchableOpacity>
      <View style={{ height: 20 }} />

      <View style={styles.postCard}>
        <Text style={styles.postTitle}>{post.title}</Text>
        <Text style={styles.postAuthor}>작성자: {post.authorNickname}</Text>
        {post.createdAt && (
          <Text style={styles.postDate}>
            {new Date(post.createdAt.seconds * 1000).toLocaleString()}
          </Text>
        )}
        {post.imageBase64 && (
          <Image
            source={{ uri: `data:image/jpeg;base64,${post.imageBase64}` }}
            style={styles.postImage}
            resizeMode="contain"
          />
        )}
        <Text style={styles.postContent}>{post.content}</Text>

        {isOwner && (
          <>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => {
                console.log("삭제 버튼 눌림");
                handleDeletePost();
              }}
            >
              <Text style={styles.deleteButtonText}>게시글 삭제</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.deleteButton,
                { backgroundColor: "#000", marginTop: 10 },
              ]}
              onPress={() =>
                router.push(`/home/create?postId=${post.id ?? routeId}`)
              }
            >
              <Text style={[styles.deleteButtonText, { color: "#fff" }]}>
                게시글 수정
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.commentCard}>
            <Text style={styles.commentAuthor}>{item.nickname}</Text>
            <Text style={styles.commentText}>{item.text}</Text>
            {item.createdAt && (
              <Text style={styles.commentDate}>
                {new Date(item.createdAt.seconds * 1000).toLocaleString()}
              </Text>
            )}
          </View>
        )}
        style={{ marginBottom: 10 }}
      />

      <TextInput
        placeholder="댓글 작성"
        value={commentText}
        onChangeText={setCommentText}
        style={styles.commentInput}
      />
      <TouchableOpacity style={styles.commentButton} onPress={handleAddComment}>
        <Text style={styles.commentButtonText}>댓글 등록</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 20 },
  backButton: { marginBottom: 10 },
  backText: { color: "#007AFF", fontWeight: "bold", fontSize: 16 },
  deleteButton: {
    backgroundColor: "red",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  deleteButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  postCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 5,
    color: "#000",
  },
  postAuthor: { fontSize: 14, color: "#555", marginBottom: 3 },
  postDate: { fontSize: 12, color: "#888", marginBottom: 10 },
  postImage: { width: "100%", height: 200, marginBottom: 10, borderRadius: 10 },
  postContent: { fontSize: 16, color: "#000" },
  commentCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  commentAuthor: { fontWeight: "700", marginBottom: 3, color: "#000" },
  commentText: { fontSize: 15, color: "#000", marginBottom: 3 },
  commentDate: { fontSize: 12, color: "#777" },
  commentInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#f9f9f9",
    marginBottom: 10,
    color: "#000",
  },
  commentButton: {
    backgroundColor: "#000",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  commentButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
