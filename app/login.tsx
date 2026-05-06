import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleLogin = async () => {
    if (!username || !password) {
      alert("Nhập đầy đủ thông tin");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "http://192.168.0.103:8080/auth/login",
        {
          username: username.trim(),
          password: password.trim(),
        }
      );

      const token = res.data.token;
      const role = res.data.role;

      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("role", role);

      router.replace("/app-entry");
    } catch (err: any) {
      console.log("LOGIN ERROR:", err?.response || err);

      const message =
        err?.response?.data ||
        err?.message ||
        "Login failed";

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#E0F7FA", "#F0FDFA", "#FFFFFF"]}
      style={styles.gradient}
    >
      <StatusBar barStyle="dark-content" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>

            {/* HEADER */}
            <View style={styles.header}>
              <Text style={styles.logo}>🚕</Text>

              <Text style={styles.title}>
                QLTaxi
              </Text>

              <Text style={styles.subtitle}>
                Đăng nhập để tiếp tục hành trình của bạn
              </Text>
            </View>

            {/* LOGIN CARD */}
            <View style={styles.card}>

              <Text style={styles.cardTitle}>
                Đăng nhập
              </Text>

              {/* USERNAME */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  Username
                </Text>

                <TextInput
                  placeholder="Nhập username"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                  value={username}
                  onChangeText={setUsername}
                  style={styles.input}
                />
              </View>

              {/* PASSWORD */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  Password
                </Text>

                <TextInput
                  placeholder="Nhập password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  style={styles.input}
                />
              </View>

              {/* BUTTON */}
              <TouchableOpacity
                style={styles.button}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>
                    ĐĂNG NHẬP
                  </Text>
                )}
              </TouchableOpacity>

              {/* REGISTER */}
              <TouchableOpacity
                onPress={() => router.push("/register")}
              >
                <Text style={styles.register}>
                  Chưa có tài khoản? Đăng ký
                </Text>
              </TouchableOpacity>
            </View>

            {/* FOOTER */}
            <Text style={styles.footer}>
              Di chuyển an toàn • Nhanh chóng • Hiện đại
            </Text>

          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },

  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  header: {
    alignItems: "center",
    marginBottom: 35,
  },

  logo: {
    fontSize: 70,
    marginBottom: 10,
  },

  title: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 10,
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 24,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
    padding: 28,
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 8,
  },

  cardTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0F172A",
    marginBottom: 25,
  },

  inputContainer: {
    marginBottom: 18,
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 10,
  },

  input: {
    backgroundColor: "#F8FAFC",
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    fontSize: 16,
    color: "#0F172A",
  },

  button: {
    backgroundColor: "#14B8A6",
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 10,
    elevation: 3,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },

  register: {
    marginTop: 24,
    textAlign: "center",
    color: "#0891B2",
    fontWeight: "700",
    fontSize: 15,
  },

  footer: {
    marginTop: 25,
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 14,
  },
});