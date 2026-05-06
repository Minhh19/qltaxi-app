import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";

const BASE_URL = "http://192.168.0.103:8080";

export default function DriverTrip() {
  const router = useRouter();

  const [trip, setTrip] = useState<any>(null);
  const [location, setLocation] = useState<any>(null);
  const [routeCoords, setRouteCoords] = useState<any[]>([]);
  const [isNavigating, setIsNavigating] = useState(false);

  // ===== FETCH TRIP =====
  const fetchTrip = async () => {
    const token = await AsyncStorage.getItem("token");

    try {
      const res = await axios.get(`${BASE_URL}/trips/driver/my-trip`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 🔥 FIX: không set null khi API trả []
      if (!res.data || res.data.length === 0) {
        return;
      }

      setTrip(res.data[0]);
    } catch (err) {
      console.log("❌ FETCH TRIP:", err);
    }
  };

  // ===== GPS =====
  const startTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;

    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 2000,
        distanceInterval: 5,
      },
      (loc) => {
        const coords = loc.coords;

        setLocation({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });

        sendLocation(coords);
      }
    );
  };

  // ===== SEND LOCATION =====
  const sendLocation = async (coords: any) => {
    const token = await AsyncStorage.getItem("token");

    try {
      await axios.put(
        `${BASE_URL}/driver/location?latitude=${coords.latitude}&longitude=${coords.longitude}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (err) {
      console.log("❌ SEND LOCATION:", err);
    }
  };

  // ===== FETCH ROUTE =====
  const fetchRoute = async (start: any, end: any) => {
    if (
      !start ||
      !end ||
      start.latitude == null ||
      start.longitude == null ||
      end.latitude == null ||
      end.longitude == null
    ) {
      return;
    }

    try {
      const res = await axios.get(
        `http://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`
      );

      const coords = res.data.routes[0].geometry.coordinates;

      const route = coords.map((c: any) => ({
        latitude: c[1],
        longitude: c[0],
      }));

      setRouteCoords(route);
    } catch (err) {
      console.log("❌ ROUTE ERROR:", err);
    }
  };

  // ===== START PICKUP =====
  const handleGoPickup = async () => {
  await callApi(`/trips/${trip.id}/start`);
  setIsNavigating(true);
};
const handlePicked = async () => {
  await callApi(`/trips/${trip.id}/pickup`);
  };
  // ===== COMPLETE =====
const handleComplete = async () => {
  try {

    const token = await AsyncStorage.getItem("token");

    await axios.post(
      `${BASE_URL}/trips/${trip.id}/complete`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert("🎉 Hoàn thành chuyến");

    // reset toàn bộ state
    setTrip(null);

    setRouteCoords([]);

    setIsNavigating(false);

    // quay về trạng thái ban đầu
    router.replace("/driver");

  } catch (err: any) {

    console.log("❌ COMPLETE ERROR:", err.response || err);

    alert(
      err.response?.data?.message ||
      err.response?.data ||
      err.message
    );
  }
};
  // ===== API =====
  const callApi = async (url: string) => {
    const token = await AsyncStorage.getItem("token");

    try {
      await axios.post(`${BASE_URL}${url}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchTrip();
    } catch (err) {
      console.log("❌ API ERROR:", err);
    }
  };

  // ===== LOGOUT =====
  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("role");
    router.replace("/login");
  };

  // ===== INIT =====
  useEffect(() => {
    fetchTrip();
    startTracking();

    const interval = setInterval(fetchTrip, 5000);
    return () => clearInterval(interval);
  }, []);

  // ===== ROUTE LOGIC =====
  useEffect(() => {
    if (!location || !trip) return;

    const pickup = {
      latitude: trip.pickupLat,
      longitude: trip.pickupLng,
    };

    const dropoff = {
      latitude: trip.dropoffLat,
      longitude: trip.dropoffLng,
    };

    // 👉 chỉ gọi khi cần
    if (trip.status === "PICKUP" || isNavigating) {
      fetchRoute(location, pickup);
    }

    if (trip.status === "IN_PROGRESS") {
      fetchRoute(location, dropoff);
    }
  }, [location, trip, isNavigating]);

  if (!trip || !location) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        region={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {/* Driver */}
        <Marker coordinate={location} title="Driver" />


        {/* Route */}
        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeWidth={4}
            strokeColor="blue"
          />
        )}
      </MapView>

      {/* Logout */}
      {(trip.status === "PICKUP" || trip.status === "IN_PROGRESS") && (
        <TouchableOpacity style={styles.logout} onPress={handleLogout}>
          <Text style={{ color: "#fff" }}>Logout</Text>
        </TouchableOpacity>
      )}

      {/* UI */}
      <View style={styles.bottom}>
        <Text>Status: {trip.status}</Text>

        {trip.status === "ACCEPTED" && (
          <TouchableOpacity style={styles.button} onPress={handleGoPickup}>
            <Text style={styles.buttonText}>🚕 Đi đón khách</Text>
          </TouchableOpacity>
        )}
        {trip.status === "PICKUP" && (
  <TouchableOpacity
    style={styles.button}
    onPress={handlePicked}
  >
    <Text style={styles.buttonText}>
      ✅ Đã đón khách
    </Text>
  </TouchableOpacity>
)}

{trip.status === "IN_PROGRESS" && (
  <TouchableOpacity
    style={styles.button}
    onPress={handleComplete}
  >
    <Text style={styles.buttonText}>
      🏁 Hoàn thành chuyến
    </Text>
  </TouchableOpacity>
)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  bottom: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#fff",
    padding: 20,
  },

  button: {
    marginTop: 10,
    backgroundColor: "black",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  logout: {
    position: "absolute",
    top: 60,
    right: 20,
    backgroundColor: "red",
    padding: 10,
    borderRadius: 8,
    zIndex: 999,
  },
});