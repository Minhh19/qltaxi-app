import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function CustomerHome() {
  const router = useRouter();

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token"); // xóa token
    await AsyncStorage.removeItem("role");  // xóa role

    router.replace("/login"); // 🔥 quay về login
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Customer Home 🚕</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/customer/create-trip")}
      >
        <Text style={styles.buttonText}>ĐẶT XE</Text>
      </TouchableOpacity>

      {/* 🔥 NÚT LOGOUT */}
      <TouchableOpacity style={styles.logout} onPress={handleLogout}>
        <Text style={styles.logoutText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  logout: {
    padding: 10,
  },
  logoutText: {
    color: "red",
    fontWeight: "bold",
  },
});