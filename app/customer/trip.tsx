import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router"; // ✅ thêm
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";


const BASE_URL = "http://192.168.0.103:8080";

export default function CustomerTrip() {
  const [trip, setTrip] = useState<any>(null);
  const [driverLocation, setDriverLocation] = useState<any>(null);
  const router = useRouter(); // ✅ thêm

  // ===== FETCH TRIP =====
  const fetchTrip = async () => {
    const token = await AsyncStorage.getItem("token");

    try {
      const res = await axios.get(`${BASE_URL}/trips/my-trip`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.data || res.data.length === 0) return;

      const t = res.data[0];
      setTrip(t);

      if (t.status === "PICKUP" || t.status === "IN_PROGRESS") {
        fetchDriverLocation(t.id);
      }
    } catch (err) {
      console.log("❌ FETCH TRIP:", err);
    }
  };

  // ===== FETCH DRIVER LOCATION =====
  const fetchDriverLocation = async (tripId: number) => {
    const token = await AsyncStorage.getItem("token");

    try {
      const res = await axios.get(
        `${BASE_URL}/trips/${tripId}/driver-location`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.data?.latitude || !res.data?.longitude) return;

      setDriverLocation({
        latitude: res.data.latitude,
        longitude: res.data.longitude,
      });
    } catch (err) {
      console.log("❌ DRIVER LOCATION:", err);
    }
  };

  // ===== POLLING =====
  useEffect(() => {
    fetchTrip();

    const interval = setInterval(fetchTrip, 2000);
    return () => clearInterval(interval);
  }, []);

  // ===== BACK BUTTON =====
  const handleBack = () => {
    router.replace("/customer");
  };

  // ===== WAITING =====
  if (!trip || trip.status === "PENDING") {
  return (
    <View style={styles.loadingContainer}>
      <StatusBar barStyle="light-content" />
       {/* BACK BUTTON */}
      <TouchableOpacity
        onPress={handleBack}
        style={styles.waitingBackButton}
      >
        <Text style={styles.waitingBackText}>←</Text>
      </TouchableOpacity>

      <View style={styles.loadingCard}>
        <ActivityIndicator size="large" color="#111827" />

        <Text style={styles.loadingTitle}>
          Đang tìm tài xế
        </Text>

        <Text style={styles.loadingSubtitle}>
          Vui lòng chờ trong giây lát...
        </Text>
      </View>
    </View>
  );
}

 // ===== ACCEPTED =====
if (trip.status === "ACCEPTED") {
  return (
    <View style={styles.acceptedContainer}>
      <StatusBar barStyle="dark-content" />

      {/* BACK */}
      <TouchableOpacity
        onPress={handleBack}
        style={styles.waitingBackButton}
      >
        <Text style={styles.waitingBackText}>←</Text>
      </TouchableOpacity>

      <View style={styles.acceptedCard}>
        <Text style={styles.acceptedEmoji}>🎉</Text>

        <Text style={styles.acceptedTitle}>
          Đã tìm thấy tài xế
        </Text>

        <Text style={styles.acceptedSubtitle}>
          Tài xế đang chuẩn bị đến đón bạn
        </Text>

        <View style={styles.acceptedDivider} />

        <View style={styles.infoRow}>
          <Text style={styles.label}>Điểm đón</Text>
          <Text style={styles.value}>{trip.pickupAddress}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Điểm đến</Text>
          <Text style={styles.value}>{trip.dropoffAddress}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Giá chuyến đi</Text>
          <Text style={styles.price}>{trip.price}đ</Text>
        </View>

        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>DRIVER ACCEPTED</Text>
        </View>
      </View>
    </View>
  );
}
  // ===== PICKUP =====
if (trip.status === "PICKUP") {
  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />

      <MapView
        style={{ flex: 1 }}
        region={{
          latitude: driverLocation?.latitude || trip.pickupLat,
          longitude: driverLocation?.longitude || trip.pickupLng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker
          coordinate={{
            latitude: trip.pickupLat,
            longitude: trip.pickupLng,
          }}
          title="Điểm đón"
        />

        {driverLocation && (
          <Marker coordinate={driverLocation} title="Tài xế" />
        )}
      </MapView>

      {/* BACK */}
      <TouchableOpacity
        onPress={handleBack}
        style={styles.backButton}
      >
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>

      {/* TOP CARD */}
      <View style={styles.topCard}>
        <Text style={styles.topTitle}>
          🚗 Tài xế đang đến đón bạn
        </Text>

        <Text style={styles.topSubtitle}>
          Vui lòng chuẩn bị trước khi tài xế đến
        </Text>
      </View>

      {/* BOTTOM SHEET */}
      <View style={styles.bottomSheet}>
        <Text style={styles.sheetTitle}>Thông tin chuyến đi</Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Điểm đón</Text>
          <Text style={styles.value}>{trip.pickupAddress}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Điểm đến</Text>
          <Text style={styles.value}>{trip.dropoffAddress}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Giá tiền</Text>
          <Text style={styles.price}>{trip.price}đ</Text>
        </View>
      </View>
    </View>
  );
}

  // ===== IN_PROGRESS =====
  return (
  <View style={{ flex: 1 }}>
    <StatusBar barStyle="dark-content" />

    <MapView
      style={{ flex: 1 }}
      region={{
        latitude: driverLocation?.latitude || trip.dropoffLat,
        longitude: driverLocation?.longitude || trip.dropoffLng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
    >
      <Marker
        coordinate={{
          latitude: trip.dropoffLat,
          longitude: trip.dropoffLng,
        }}
        title="Điểm đến"
      />

      {driverLocation && (
        <Marker coordinate={driverLocation} title="Tài xế" />
      )}
    </MapView>

    {/* BACK */}
    <TouchableOpacity
      onPress={handleBack}
      style={styles.backButton}
    >
      <Text style={styles.backText}>←</Text>
    </TouchableOpacity>

    {/* TOP CARD */}
    <View style={styles.topCard}>
      <Text style={styles.topTitle}>
        🚕 Đang di chuyển
      </Text>

      <Text style={styles.topSubtitle}>
        Bạn đang trên đường đến điểm đến
      </Text>
    </View>

    {/* BOTTOM */}
    <View style={styles.bottomSheet}>
      <Text style={styles.sheetTitle}>Chuyến đi đang diễn ra</Text>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Điểm đến</Text>
        <Text style={styles.value}>{trip.dropoffAddress}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Trạng thái</Text>
        <Text style={styles.active}>IN PROGRESS</Text>
      </View>
    </View>
  </View>

  
);


}
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#DFF7F2",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  loadingCard: {
    backgroundColor: "#fff",
    width: "100%",
    borderRadius: 28,
    padding: 40,
    alignItems: "center",
  },

  loadingTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
    color: "#0F766E",
  },

  loadingSubtitle: {
    marginTop: 10,
    color: "#6B7280",
    fontSize: 15,
  },

  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    width: 50,
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
  },

  backText: {
    fontSize: 24,
    fontWeight: "bold",
  },

  topCard: {
    position: "absolute",
    top: 60,
    left: 85,
    right: 20,
    backgroundColor:  "#ECFEFF",
    padding: 18,
    borderRadius: 20,
    elevation: 10,
  },

  topTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },

  topSubtitle: {
    marginTop: 5,
    color: "#6B7280",
  },

  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor:  "#F8FFFE",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    elevation: 20,
  },

  sheetTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 25,
    color:"#06B6D4",
  },

  infoRow: {
    marginBottom: 18,
  },

  label: {
    color: "#6B7280",
    marginBottom: 5,
  },

  value: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },

  price: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#16A34A",
  },

  active: {
    color: "#2563EB",
    fontWeight: "bold",
    fontSize: 16,
  },
  waitingBackButton: {
  position: "absolute",
  top: 60,
  left: 20,
  width: 50,
  height: 50,
  backgroundColor: "#fff",
  borderRadius: 25,
  justifyContent: "center",
  alignItems: "center",
  elevation: 10,
},

waitingBackText: {
  fontSize: 24,
  fontWeight: "bold",
  color: "#111827",
},
acceptedContainer: {
  flex: 1,
  backgroundColor: "#DFF7F2",
  justifyContent: "center",
  alignItems: "center",
  padding: 24,
},

acceptedCard: {
  width: "100%",
  backgroundColor: "#FFFFFF",
  borderRadius: 32,
  padding: 30,
  elevation: 12,
},

acceptedEmoji: {
  fontSize: 60,
  textAlign: "center",
  marginBottom: 15,
},

acceptedTitle: {
  fontSize: 28,
  fontWeight: "bold",
  textAlign: "center",
  color: "#0F766E",
},

acceptedSubtitle: {
  marginTop: 10,
  textAlign: "center",
  color: "#6B7280",
  fontSize: 16,
  lineHeight: 24,
},

acceptedDivider: {
  height: 1,
  backgroundColor: "#E5E7EB",
  marginVertical: 25,
},

statusBadge: {
  marginTop: 20,
  backgroundColor: "#CCFBF1",
  paddingVertical: 12,
  borderRadius: 15,
  alignItems: "center",
},

statusText: {
  color: "#0F766E",
  fontWeight: "bold",
  fontSize: 15,
},
});