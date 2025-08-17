import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { auth, db } from "../_utils/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { router } from "expo-router";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");

  const handleRegister = async () => {
    if (!nickname) return Alert.alert("닉네임을 입력하세요.");
    if (!email || !password)
      return Alert.alert("이메일과 비밀번호를 입력하세요.");

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await updateProfile(user, { displayName: nickname });

      await setDoc(doc(db, "users", user.uid), {
        email,
        nickname,
        createdAt: serverTimestamp(),
      });

      Alert.alert("회원가입 성공!");
      router.replace("./login");
    } catch (error: any) {
      Alert.alert("회원가입 실패", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>회원가입</Text>

      <TextInput
        placeholder="닉네임"
        value={nickname}
        onChangeText={setNickname}
        style={styles.input}
      />
      <TextInput
        placeholder="이메일"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="비밀번호"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>회원가입</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("./login")}>
        <Text style={styles.link}>로그인으로 이동</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    justifyContent: "center",
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  link: { color: "#007AFF", textAlign: "center", marginTop: 10, fontSize: 14 },
});
