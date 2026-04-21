import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";

export default function CreateTrip() {
  const router = useRouter();

  const [pickupText, setPickupText] = useState("");
  const [destinationText, setDestinationText] = useState("");

  const [pickup, setPickup] = useState<any>(null);
  const [destination, setDestination] = useState<any>(null);

  const [region, setRegion] = useState<any>(null);

  // 📍 lấy vị trí hiện tại
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const loc = await Location.getCurrentPositionAsync({});
      const coords = loc.coords;

      setRegion({
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      // set pickup mặc định = vị trí hiện tại
      setPickup(coords);
    })();
  }, []);

  // 🔍 search location (ENTER mới gọi → tránh 429)
  const searchLocation = async (text: string, isPickup: boolean) => {
    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/search`,
        {
          params: {
            q: text,
            format: "json",
            limit: 1,
          },
        }
      );

      if (res.data.length === 0) {
        alert("Không tìm thấy địa điểm");
        return;
      }

      const place = res.data[0];

      const lat = parseFloat(place.lat);
      const lon = parseFloat(place.lon);

      if (isPickup) {
        setPickup({ latitude: lat, longitude: lon });
        setPickupText(place.display_name);
      } else {
        setDestination({ latitude: lat, longitude: lon });
        setDestinationText(place.display_name);
      }

      setRegion({
        latitude: lat,
        longitude: lon,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

    } catch (err) {
      console.log("SEARCH ERROR:", err);
      alert("Lỗi tìm địa điểm");
    }
  };

  // 🚕 CREATE TRIP
  const handleCreateTrip = async () => {
  if (!pickup || !destination) {
    alert("Chọn đủ điểm đón và điểm đến");
    return;
  }

  try {
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      alert("Chưa đăng nhập");
      return;
    }

    const res = await axios.post(
      "http://192.168.1.50:8080/trips",
      {
        pickupAddress: pickupText,
        dropoffAddress: destinationText,
        pickupLatitude: pickup.latitude,
        pickupLongitude: pickup.longitude,
        dropoffLatitude: destination.latitude,
        dropoffLongitude: destination.longitude,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, // 🔥 bắt buộc
        },
      }
    );

    console.log("TRIP CREATED:", res.data);

    // 👉 CHUYỂN MÀN + TRUYỀN ID
    router.push(`/customer/trip?id=${res.data.id}`);

  } catch (err: any) {
    console.log("CREATE ERROR:", err.response || err);
    alert(err.response?.data || err.message);
  }
};
  

  if (!region) return null;

  return (
    <View style={{ flex: 1 }}>
      {/* MAP */}
      <MapView style={{ flex: 1 }} region={region}>
        {pickup && <Marker coordinate={pickup} title="Điểm đón" />}
        {destination && <Marker coordinate={destination} title="Điểm đến" />}
      </MapView>

      {/* INPUT */}
      <View style={styles.overlay}>
        <TextInput
          placeholder="Điểm đón"
          value={pickupText}
          onChangeText={setPickupText}
          onSubmitEditing={(e) =>
            searchLocation(e.nativeEvent.text, true)
          }
          style={styles.input}
          returnKeyType="search"
        />

        <TextInput
          placeholder="Điểm đến"
          value={destinationText}
          onChangeText={setDestinationText}
          onSubmitEditing={(e) =>
            searchLocation(e.nativeEvent.text, false)
          }
          style={styles.input}
          returnKeyType="search"
        />
      </View>

      {/* BUTTON */}
      <TouchableOpacity style={styles.button} onPress={handleCreateTrip}>
        <Text style={styles.buttonText}>ĐẶT XE 🚕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 60,
    width: "100%",
    padding: 10,
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  button: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});