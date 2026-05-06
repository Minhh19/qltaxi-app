import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

const BASE_URL = "http://192.168.0.103:8080";

export default function CustomerHome() {
  const router = useRouter();

  const [hasActiveTrip, setHasActiveTrip] = useState(false);

  // ===== LOGOUT =====
  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("role");

    router.replace("/login");
  };

  // ===== FETCH ACTIVE TRIP =====
  const fetchMyTrip = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await axios.get(
        `${BASE_URL}/trips/my-trip`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.data || res.data.length === 0) {
        setHasActiveTrip(false);
        return;
      }

      const trip = res.data[0];

      const activeStatuses = [
        "PENDING",
        "ACCEPTED",
        "PICKUP",
        "IN_PROGRESS",
      ];

      setHasActiveTrip(
        activeStatuses.includes(trip.status)
      );
    } catch (err) {
      console.log(err);
    }
  };

  // ===== LOAD =====
  useEffect(() => {
    fetchMyTrip();
  }, []);

  return (
    <LinearGradient
      colors={["#E0F7FA", "#F0FDFA", "#FFFFFF"]}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Xin chào 👋</Text>

        <Text style={styles.title}>
          Đặt xe dễ dàng
        </Text>

        <Text style={styles.subtitle}>
          Di chuyển nhanh chóng và an toàn mỗi ngày
        </Text>
      </View>

      {/* MAIN CARD */}
      <View style={styles.card}>
        <View style={styles.locationBox}>
          <Text style={styles.locationLabel}>
            📍 Bạn muốn đi đâu?
          </Text>

          <Text style={styles.locationHint}>
            Chọn điểm đón và điểm đến của bạn
          </Text>
        </View>

        {/* BOOK BUTTON */}
        <TouchableOpacity
          style={[
            styles.bookButton,
            hasActiveTrip && styles.disabledButton,
          ]}
          disabled={hasActiveTrip}
          onPress={() => {
            if (hasActiveTrip) {
              router.push("/customer/trip");
            } else {
              router.push("/customer/create-trip");
            }
          }}
        >
          <Text style={styles.bookButtonText}>
            {hasActiveTrip
              ? "🚫 ĐANG CÓ CHUYẾN ĐI"
              : "🚕 ĐẶT XE NGAY"}
          </Text>
        </TouchableOpacity>

        {/* CURRENT TRIP */}
       {/* CURRENT TRIP */}
{hasActiveTrip && (
  <TouchableOpacity
    style={styles.historyButton}
    onPress={() => router.push("/customer/trip")}
  >
    <Text style={styles.historyText}>
      🚖 Chuyến đi hiện tại
    </Text>
  </TouchableOpacity>
)}
      </View>

      {/* FEATURES */}
      <View style={styles.infoContainer}>
        <View style={styles.infoBox}>
          <Text style={styles.infoEmoji}>⚡</Text>

          <Text style={styles.infoTitle}>
            Nhanh chóng
          </Text>

          <Text style={styles.infoDesc}>
            Kết nối tài xế gần bạn trong vài giây
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoEmoji}>🛡️</Text>

          <Text style={styles.infoTitle}>
            An toàn
          </Text>

          <Text style={styles.infoDesc}>
            Theo dõi hành trình realtime dễ dàng
          </Text>
        </View>
      </View>

      {/* PROMOTION */}
      <View style={styles.bottomCard}>
        <Text style={styles.bottomTitle}>
          🎁 Ưu đãi hôm nay
        </Text>

        <Text style={styles.bottomDesc}>
          Giảm 20% cho chuyến đi đầu tiên của bạn
        </Text>
      </View>

      {/* LOGOUT */}
      <TouchableOpacity
        style={styles.logout}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>
          Đăng xuất
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 30,
    justifyContent: "flex-start",
    gap: 18,
  },

  header: {
    marginTop: 0,
  },

  greeting: {
    color: "#0F766E",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#0F172A",
    lineHeight: 42,
  },

  subtitle: {
    marginTop: 10,
    fontSize: 16,
    color: "#64748B",
    lineHeight: 24,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
    padding: 22,
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 8,
  },

  locationBox: {
    backgroundColor: "#F0FDFA",
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
  },

  locationLabel: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0F172A",
  },

  locationHint: {
    marginTop: 8,
    color: "#64748B",
    fontSize: 15,
  },

  bookButton: {
    backgroundColor: "#14B8A6",
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 14,
    elevation: 3,
  },

  disabledButton: {
    backgroundColor: "#94A3B8",
  },

  bookButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },

  historyButton: {
    backgroundColor: "#ECFEFF",
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CFFAFE",
  },

  historyText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0891B2",
  },

  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  infoBox: {
    width: width * 0.41,
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 26,
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 5,
  },

  infoEmoji: {
    fontSize: 32,
    marginBottom: 14,
  },

  infoTitle: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },

  infoDesc: {
    color: "#64748B",
    fontSize: 14,
    lineHeight: 22,
  },

  bottomCard: {
    backgroundColor: "#CCFBF1",
    borderRadius: 28,
    padding: 18,
  },

  bottomTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#115E59",
    marginBottom: 10,
  },

  bottomDesc: {
    color: "#0F766E",
    fontSize: 15,
    lineHeight: 22,
  },

  logout: {
    alignItems: "center",
    marginTop: 5,
  },

  logoutText: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "bold",
  },
});