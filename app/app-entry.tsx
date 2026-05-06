import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

const BASE_URL = "http://192.168.0.103:8080";

export default function AppEntry() {
  const router = useRouter();

  useEffect(() => {
    checkActiveTrip();
  }, []);

  const checkActiveTrip = async () => {
    const token = await AsyncStorage.getItem("token");
    const role = await AsyncStorage.getItem("role");

    if (!token || !role) {
      router.replace("/login");
      return;
    }

    try {
      // 👤 CUSTOMER
      if (role === "CUSTOMER") {
        const res = await axios.get(`${BASE_URL}/trips/my-trip`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.length > 0) {
          const trip = res.data[0];

          router.replace({
            pathname: "/customer/trip",
            params: { tripId: trip.id },
          });
          return;
        }

        router.replace("/customer"); // hoặc home customer
      }

      // 🚗 DRIVER
      if (role === "DRIVER") {
        const res = await axios.get(`${BASE_URL}/trips/driver/my-trip`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.length > 0) {
          const trip = res.data[0];

          router.replace({
            pathname: "/driver/trip",
            params: { tripId: trip.id },
          });
          return;
        }

        router.replace("/driver"); // hoặc home driver
      }
    } catch (err) {
      console.log("❌ checkActiveTrip lỗi", err);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ActivityIndicator size="large" />
      <Text>Đang khôi phục trạng thái...</Text>
    </View>
  );
}