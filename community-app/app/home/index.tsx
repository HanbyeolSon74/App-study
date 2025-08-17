import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import { db, auth } from "../_utils/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { router } from "expo-router";
import type { ExternalPathString } from "expo-router";

type Post = {
  id: string;
  title: string;
  content: string;
  imageBase64?: string;
  authorId: string;
  nickname?: string;
  createdAt: any;
  commentsCount?: number;
};

export default function HomeScreen() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const list: Post[] = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data() as Post;

          const commentsSnap = await getDocs(
            collection(db, "posts", docSnap.id, "comments")
          );

          let nickname = "익명";
          if (data.authorId) {
            const userDoc = await getDoc(doc(db, "users", data.authorId));
            nickname = userDoc.exists() ? userDoc.data()?.nickname : "익명";
          }

          return {
            ...data,
            id: docSnap.id,
            commentsCount: commentsSnap.size,
            nickname,
          };
        })
      );
      setPosts(list);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.replace("/auth/login");
    } catch (error: any) {
      Alert.alert("로그아웃 실패", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.writeButton}
          onPress={() => router.push("/home/create")}
        >
          <Text style={styles.writeButtonText}>글 작성</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>로그아웃</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 10 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/home/post/${item.id}`)}
            style={styles.card}
          >
            {item.imageBase64 && (
              <Image
                source={{ uri: `data:image/png;base64,${item.imageBase64}` }}
                style={styles.image}
                resizeMode="cover"
              />
            )}

            <Text style={styles.title}>{item.title}</Text>

            <Text style={styles.content} numberOfLines={2}>
              {item.content}
            </Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoText}>
                작성자: {item.nickname || "익명"}
              </Text>
              <Text style={styles.infoText}>
                댓글: {item.commentsCount || 0}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 16 },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 70,
    marginBottom: 20,
  },
  writeButton: {
    backgroundColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  writeButtonText: { color: "#fff", fontWeight: "bold" },
  logoutButton: {
    backgroundColor: "#888",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  logoutButtonText: { color: "#fff", fontWeight: "bold" },
  card: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: { width: "100%", height: 180, borderRadius: 10, marginBottom: 10 },
  title: { fontWeight: "700", fontSize: 18, color: "#000", marginBottom: 6 },
  content: { fontSize: 14, color: "#333", marginBottom: 8 },
  infoRow: { flexDirection: "row", justifyContent: "space-between" },
  infoText: { fontSize: 12, color: "#777" },
});
