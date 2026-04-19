import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const role = await AsyncStorage.getItem("role");

        console.log("TOKEN:", token);
        console.log("ROLE:", role);

        if (token && role === "CUSTOMER") {
          router.replace("/customer");
        } else if (token && role === "DRIVER") {
          router.replace("/driver");
        } else {
          router.replace("/login");
        }
      } catch (error) {
        console.log("CHECK LOGIN ERROR:", error);
        router.replace("/login");
      }
    };

    checkLogin();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}