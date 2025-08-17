import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { auth } from "../_utils/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { router } from "expo-router";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password)
      return Alert.alert("이메일과 비밀번호를 입력하세요.");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/home");
    } catch (error: any) {
      Alert.alert("로그인 실패", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>로그인</Text>
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

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>로그인</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("./register")}>
        <Text style={styles.link}>회원가입으로 이동</Text>
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
