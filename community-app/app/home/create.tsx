import { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  Image,
  StyleSheet,
  ScrollView,
} from "react-native";
import { db, auth } from "../_utils/firebase";
import {
  collection,
  addDoc,
  setDoc,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";

export default function CreatePost() {
  const params = useLocalSearchParams();
  const postId = params.postId as string | undefined;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [nickname, setNickname] = useState("");
  const [authorId, setAuthorId] = useState<string | null>(null);

  useEffect(() => {
    const fetchNickname = async () => {
      if (!auth.currentUser) return;
      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (userDoc.exists()) setNickname(userDoc.data().nickname);
    };

    const fetchPost = async () => {
      if (!postId) return;
      const postDoc = await getDoc(doc(db, "posts", postId));
      if (postDoc.exists()) {
        const data = postDoc.data();
        setTitle(data.title);
        setContent(data.content);
        setImageBase64(data.imageBase64 ?? null);
        setAuthorId(data.authorId ?? null);
      }
    };

    fetchNickname();
    fetchPost();
  }, [postId]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.5,
    });
    if (!result.canceled) setImageBase64(result.assets[0].base64 ?? null);
  };

  const handleSubmit = async () => {
    if (!auth.currentUser) return Alert.alert("로그인이 필요합니다.");
    if (!title || !content) return Alert.alert("제목과 내용을 입력하세요.");

    try {
      if (postId && authorId === auth.currentUser.uid) {
        await setDoc(
          doc(db, "posts", postId),
          { title, content, imageBase64 },
          { merge: true }
        );
        Alert.alert("게시글 수정 완료!");
      } else {
        await addDoc(collection(db, "posts"), {
          title,
          content,
          imageBase64,
          authorId: auth.currentUser.uid,
          authorNickname: nickname || "익명",
          createdAt: serverTimestamp(),
        });
        Alert.alert("게시글 작성 완료!");
      }
      router.replace("/home");
    } catch (error: any) {
      Alert.alert("게시글 처리 실패", error.message);
    }
  };

  const isAuthor = postId && authorId === auth.currentUser?.uid;
  const isNewPost = !postId;

  return (
    <ScrollView style={styles.container}>
      <View style={{ height: 80 }} />
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>← 뒤로가기</Text>
      </TouchableOpacity>
      <View style={{ height: 20 }} />
      <Text style={styles.header}>{isNewPost ? "글 작성" : "게시글 수정"}</Text>

      <TextInput
        placeholder="제목"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />
      <TextInput
        placeholder="내용"
        value={content}
        onChangeText={setContent}
        multiline
        style={[styles.input, { height: 120 }]}
      />

      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Text style={styles.buttonText}>이미지 선택</Text>
      </TouchableOpacity>

      {imageBase64 && (
        <Image
          source={{ uri: `data:image/jpeg;base64,${imageBase64}` }}
          style={styles.imagePreview}
        />
      )}

      {(isNewPost || isAuthor) && (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#000" }]}
          onPress={handleSubmit}
        >
          <Text style={[styles.buttonText, { color: "#fff" }]}>
            {isNewPost ? "게시글 작성" : "게시글 수정"}
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 20 },
  backButton: {},
  backText: { color: "#007AFF", fontWeight: "bold", fontSize: 16 },
  header: { fontSize: 24, fontWeight: "700", marginBottom: 20, color: "#000" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    backgroundColor: "#f9f9f9",
    color: "#000",
  },
  button: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#eee",
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: { fontWeight: "700", fontSize: 16 },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
});
