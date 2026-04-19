import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Button, Text, View } from "react-native";

export default function Customer() {
  const router = useRouter();

  const handleBack = async () => {
    await AsyncStorage.clear(); // 🔥 xóa token + role
    router.replace("/login");
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>
        Customer Screen 🚕
      </Text>

      <Button title="Back to Login" onPress={handleBack} />
    </View>
  );
}