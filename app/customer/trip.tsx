import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function TripScreen() {
  const [trip, setTrip] = useState<any>(null);
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // 🚕 animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // 📡 fetch trip
  const fetchTrip = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await axios.get(
        "http://192.168.1.50:8080/trips/my-trip",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const currentTrip = res.data[0];
      setTrip(currentTrip);

      // 🚀 nếu driver nhận → chuyển màn
      if (currentTrip?.status === "ACCEPTED") {
        router.replace("/customer/tracking");
      }

    } catch (err: any) {
      console.log("FETCH ERROR:", err.response || err);
    }
  };

  // 🔁 polling
  useEffect(() => {
    fetchTrip();

    const interval = setInterval(fetchTrip, 5000);

    return () => clearInterval(interval);
  }, []);

  // ❌ cancel trip
  const handleCancel = async () => {
    if (!trip) return;

    try {
      const token = await AsyncStorage.getItem("token");

      await axios.post(
        `http://192.168.0.100:8080/trips/${trip.id}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Đã hủy chuyến ❌");

      router.replace("/customer");

    } catch (err: any) {
      console.log("CANCEL ERROR:", err.response || err);
      alert(err.response?.data || err.message);
    }
  };

  // ⏳ loading
  if (!trip) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 🚕 icon animation */}
      <Animated.Text
        style={[styles.icon, { transform: [{ scale: scaleAnim }] }]}
      >
        🚕
      </Animated.Text>

      {/* title */}
      <Text style={styles.title}>Đang tìm tài xế...</Text>

      <Text style={styles.subtitle}>
        Vui lòng chờ trong giây lát
      </Text>

      {/* 📦 trip info */}
      <View style={styles.card}>
        <Text style={styles.label}>Điểm đón</Text>
        <Text style={styles.value}>{trip.pickupAddress}</Text>

        <Text style={styles.label}>Điểm đến</Text>
        <Text style={styles.value}>{trip.dropoffAddress}</Text>
      </View>

      {/* ❌ cancel */}
      <TouchableOpacity
        style={styles.cancelBtn}
        onPress={handleCancel}
      >
        <Text style={styles.cancelText}>HỦY CHUYẾN</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  icon: {
    fontSize: 60,
    marginBottom: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },

  subtitle: {
    color: "gray",
    marginBottom: 30,
  },

  card: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
    elevation: 3,
  },

  label: {
    color: "gray",
    fontSize: 12,
  },

  value: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
  },

  cancelBtn: {
    backgroundColor: "red",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
  },

  cancelText: {
    color: "#fff",
    fontWeight: "bold",
  },
});