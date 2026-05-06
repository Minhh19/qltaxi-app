import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function DriverHome() {
  const [trips, setTrips] = useState<any[]>([]);
  const [online, setOnline] = useState(true);

  const router = useRouter();

  // ================= FETCH TRIPS =================
  const fetchTrips = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await axios.get(
        "http://192.168.0.103:8080/trips/available",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTrips(res.data);
    } catch (err: any) {
      console.log("FETCH TRIP ERROR:", err?.response || err);

      // auto logout nếu token lỗi
      if (err?.response?.status === 401) {
        await AsyncStorage.clear();
        router.replace("/login");
      }
    }
  };

  useEffect(() => {
    fetchTrips();

    const interval = setInterval(fetchTrips, 5000);
    return () => clearInterval(interval);
  }, []);

  // ================= ACCEPT =================
  const handleAccept = async (tripId: number) => {
    try {
      const token = await AsyncStorage.getItem("token");

      await axios.post(
        `http://192.168.0.103:8080/trips/${tripId}/accept`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("CLICK ACCEPT:", tripId);
      console.log("CALL API ACCEPT");

      alert("Đã nhận chuyến 🚕");
      router.replace("/driver/trip");
    } catch (err: any) {
      console.log("ACCEPT ERROR:", err?.response || err);
      alert(err?.response?.data || err.message);
    }
  };

  // ================= BACK (ĐÃ FIX) =================
 const handleBack = () => {
  router.replace("/driver");
};

  // ================= RENDER =================
  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
     <Text>Điểm đón: {item.pickupAddress}</Text>
<Text>Điểm đến: {item.dropoffAddress}</Text>
<Text>
  Khoảng cách: {item.distance.toFixed(1)} km
</Text>

<Text>
  Giá: {Math.round(item.price).toLocaleString()} đ
</Text>
      <TouchableOpacity
        style={styles.acceptBtn}
        onPress={() => handleAccept(item.id)}
      >
        <Text style={{ color: "#fff", fontWeight: "bold" }}>
          NHẬN CHUYẾN
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Xin chào tài xế 🚕</Text>

        <View style={{ flexDirection: "row", gap: 10 }}>
          {/* ONLINE/OFFLINE */}
          <TouchableOpacity
            style={[
              styles.statusBtn,
              { backgroundColor: online ? "green" : "gray" },
            ]}
            onPress={() => setOnline(!online)}
          >
            <Text style={{ color: "#fff" }}>
              {online ? "ONLINE" : "OFFLINE"}
            </Text>
          </TouchableOpacity>

          {/* BACK */}
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleBack}
          >
            <Text style={{ color: "#fff" }}>QUAY LẠI</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* LIST TRIP */}
      <FlatList
        data={trips}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20 }}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 50 }}>
            Không có chuyến nào 🚫
          </Text>
        }
      />
    </View>
  );
}

// ================= STYLE =================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  header: {
    padding: 20,
    backgroundColor: "#000",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  statusBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },

  logoutBtn: {
    backgroundColor: "red",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 3,
  },

  label: {
    color: "gray",
    fontSize: 12,
  },

  value: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
  },

  acceptBtn: {
    backgroundColor: "green",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
});