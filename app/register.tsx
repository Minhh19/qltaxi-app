import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function Register() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [fullname, setFullname] = useState("");

  const handleRegister = async () => {
    if (
      !username ||
      !password ||
      !phone ||
      !email ||
      !fullname
    ) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        "http://192.168.0.103:8080/auth/register",
        {
          username: username.trim(),
          password: password.trim(),
          phone: phone.trim(),
          email: email.trim(),
          fullName: fullname.trim(),
        }
      );

      alert("Đăng ký thành công");

      router.replace("/login");
    } catch (err: any) {
      const message =
        err.response?.data ||
        err.message ||
        "Register failed";

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
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
          >
            {/* HEADER */}
            <View style={styles.header}>
              <Text style={styles.logo}>🚕</Text>

              <Text style={styles.title}>
                Tạo tài khoản
              </Text>

              <Text style={styles.subtitle}>
                Đăng ký để bắt đầu sử dụng QLTaxi
              </Text>
            </View>

            {/* CARD */}
            <View style={styles.card}>

              {/* FULLNAME */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  Họ và tên
                </Text>

                <TextInput
                  placeholder="Nhập họ và tên"
                  placeholderTextColor="#94A3B8"
                  value={fullname}
                  onChangeText={setFullname}
                  style={styles.input}
                />
              </View>

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

              {/* PHONE */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  Số điện thoại
                </Text>

                <TextInput
                  placeholder="Nhập số điện thoại"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  style={styles.input}
                />
              </View>

              {/* EMAIL */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  Email
                </Text>

                <TextInput
                  placeholder="Nhập email"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                />
              </View>

              {/* BUTTON */}
              <TouchableOpacity
                style={styles.button}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>
                    ĐĂNG KÝ
                  </Text>
                )}
              </TouchableOpacity>

              {/* LOGIN */}
              <TouchableOpacity
                onPress={() => router.replace("/login")}
              >
                <Text style={styles.link}>
                  Đã có tài khoản? Đăng nhập
                </Text>
              </TouchableOpacity>

            </View>

            {/* FOOTER */}
            <Text style={styles.footer}>
              Nhanh chóng • Hiện đại • An toàn
            </Text>

          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },

  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  header: {
    alignItems: "center",
    marginBottom: 30,
  },

  logo: {
    fontSize: 70,
    marginBottom: 10,
  },

  title: {
    fontSize: 36,
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

  link: {
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