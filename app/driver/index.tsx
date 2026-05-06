import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const BASE_URL = "http://192.168.0.103:8080";

export default function DriverDashboard() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<number>(0);
  const [hasTrip, setHasTrip] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const token = await AsyncStorage.getItem("token");

    try {
      // 🔥 1. lấy wallet
      const walletRes = await axios.get(`${BASE_URL}/driver/wallet`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setWallet(walletRes.data.balance);

      // 🔥 2. check trip hiện tại
      const tripRes = await axios.get(
        `${BASE_URL}/trips/driver/my-trip`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (tripRes.data.length > 0) {
        setHasTrip(true);
      } else {
        setHasTrip(false);
      }
    } catch (err: any) {
  console.log("STATUS:", err?.response?.status);
  console.log("DATA:", err?.response?.data);
} finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("role");
    router.replace("/login");
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator />
        <Text>Đang tải dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 20 }}>
        🚗 Driver Dashboard
      </Text>

      {/* 💰 WALLET */}
      <TouchableOpacity
        style={cardStyle}
        onPress={() => router.push("/driver/wallet")}
      >
        <Text style={titleStyle}>💰 Ví của tôi</Text>
        <Text>Số dư: {wallet} VND</Text>
      </TouchableOpacity>

      {/* 📋 TRIP LIST */}
      <TouchableOpacity
        style={cardStyle}
        onPress={() => router.push("/driver/listtrip")}
      >
        <Text style={titleStyle}>📋 Danh sách chuyến</Text>
        <Text>Xem các chuyến đang chờ</Text>
      </TouchableOpacity>

      {/* 🚗 CURRENT TRIP */}
      {hasTrip && (
        <TouchableOpacity
          style={[cardStyle, { backgroundColor: "#000" }]}
          onPress={() => router.push("/driver/trip")}
        >
          <Text style={[titleStyle, { color: "#fff" }]}>
            🚗 Chuyến hiện tại
          </Text>
          <Text style={{ color: "#fff" }}>
            Đang có chuyến - tiếp tục ngay
          </Text>
        </TouchableOpacity>
      )}

      {/* 🚪 LOGOUT */}
      <TouchableOpacity
        style={[cardStyle, { backgroundColor: "red" }]}
        onPress={handleLogout}
      >
        <Text style={{ color: "#fff", textAlign: "center" }}>
          🚪 Logout
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const cardStyle = {
  backgroundColor: "#fff",
  padding: 20,
  borderRadius: 15,
  marginBottom: 15,
  elevation: 3,
};

const titleStyle = {
  fontSize: 18,
  fontWeight: "bold" as const,
  marginBottom: 5,
};