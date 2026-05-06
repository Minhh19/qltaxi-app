import * as polyline from "@mapbox/polyline";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";

export default function CreateTrip() {
  const router = useRouter();

  const [region, setRegion] = useState<any>(null);

  const [pickup, setPickup] = useState<any>(null);
  const [destination, setDestination] = useState<any>(null);

  const [pickupText, setPickupText] = useState("");
  const [destinationText, setDestinationText] = useState("");

  // 🔥 NEW
  const [priceData, setPriceData] = useState<any>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [routeCoords, setRouteCoords] = useState<
  { latitude: number; longitude: number }[]
>([]);

const [paymentMethod, setPaymentMethod] = useState<string>("CASH");

  // ================= GIỮ NGUYÊN =================
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

      setPickup(coords);
    })();
  }, []);

  // ================= GIỮ NGUYÊN =================
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

    // ================= PREVIEW =================
const handlePreview = async () => {
  if (!pickup || !destination) {
    alert("Chọn đủ điểm");
    return;
  }

  try {
    setLoading(true);

    const token = await AsyncStorage.getItem("token");

    const res = await axios.post(
      "http://192.168.0.103:8080/trips/preview",
      {
        pickupLat: pickup.latitude,
        pickupLng: pickup.longitude,
        dropoffLat: destination.latitude,
        dropoffLng: destination.longitude,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setPriceData(res.data);

    // 🔥 ================= THÊM PHẦN NÀY =================
    if (res.data.geometry) {
      const decoded = polyline.decode(res.data.geometry).map(([lat, lng]) => ({
        latitude: lat,
        longitude: lng,
      }));

      setRouteCoords(decoded);
    }
    // 🔥 =================================================

  } catch {
    alert("Lỗi preview");
  } finally {
    setLoading(false);
  }
};

  // ================= CREATE =================
  const handleCreateTrip = async () => {
    if (!selectedVehicle) {
      alert("Chọn loại xe");
      return;
    }

    const token = await AsyncStorage.getItem("token");

    const res = await axios.post(
      "http://192.168.0.103:8080/trips",
      {
        pickupLat: pickup.latitude,
        pickupLng: pickup.longitude,
        dropoffLat: destination.latitude,
        dropoffLng: destination.longitude,
        vehicleType: selectedVehicle,
        pickupAddress: pickupText,
    dropoffAddress: destinationText,
    distance: priceData.distance,
    price: priceData.options.find((o: any) => o.type === selectedVehicle).price,
    paymentMethod: paymentMethod,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    router.push({
      pathname: "/customer/trip",
      params: { tripId: res.data.id },
    });
  };

  if (!region) return null;

 return (
  <View style={{ flex: 1 }}>
    
    {/* MAP */}
    <MapView style={{ flex: 1 }} region={region}>
      {pickup && (
        <Marker coordinate={pickup} title="Điểm đón" />
      )}

      {destination && (
        <Marker coordinate={destination} title="Điểm đến" />
      )}

      {routeCoords.length > 0 && (
        <Polyline
          coordinates={routeCoords}
          strokeWidth={5}
          strokeColor="#14B8A6"
        />
      )}
    </MapView>

    {/* BACK BUTTON */}
    <TouchableOpacity
      onPress={() => router.back()}
      style={styles.backButton}
    >
      <Text style={styles.backText}>←</Text>
    </TouchableOpacity>

    {/* TOP SEARCH CARD */}
    <View style={styles.inputBox}>

      <Text style={styles.searchTitle}>
        🚕 Tạo chuyến đi
      </Text>

      <TextInput
        placeholder="Nhập điểm đón"
        placeholderTextColor="#94A3B8"
        value={pickupText}
        onChangeText={setPickupText}
        onSubmitEditing={() =>
          searchLocation(pickupText, true)
        }
        style={styles.input}
      />

      <TextInput
        placeholder="Nhập điểm đến"
        placeholderTextColor="#94A3B8"
        value={destinationText}
        onChangeText={setDestinationText}
        onSubmitEditing={() =>
          searchLocation(destinationText, false)
        }
        style={styles.input}
      />
    </View>

    {/* BOTTOM CARD */}
    <View style={styles.card}>

      {!priceData && (
        <TouchableOpacity
          style={styles.previewBtn}
          onPress={handlePreview}
        >
          <Text style={styles.btnText}>
            XEM GIÁ CHUYẾN ĐI
          </Text>
        </TouchableOpacity>
      )}

      {loading && (
        <ActivityIndicator
          size="large"
          color="#14B8A6"
        />
      )}

      {priceData && (
        <>
          <View style={styles.tripInfo}>
            <Text style={styles.distance}>
              📍 {priceData.distance.toFixed(2)} km
            </Text>
          </View>

          <Text style={styles.sectionTitle}>
            🚘 Chọn loại xe
          </Text>

          {priceData.options.map(
            (item: any, i: number) => (
              <TouchableOpacity
                key={i}
                onPress={() =>
                  setSelectedVehicle(item.type)
                }
                style={[
                  styles.vehicle,
                  selectedVehicle === item.type &&
                    styles.selected,
                ]}
              >
                <View>
                  <Text style={styles.vehicleName}>
                    {item.type}
                  </Text>

                  <Text style={styles.vehiclePrice}>
                    {item.price.toLocaleString()}đ
                  </Text>
                </View>

                {selectedVehicle === item.type && (
                  <Text style={styles.check}>
                    ✓
                  </Text>
                )}
              </TouchableOpacity>
            )
          )}

          <Text style={styles.sectionTitle}>
            💳 Thanh toán
          </Text>

          <TouchableOpacity
            style={[
              styles.vehicle,
              paymentMethod === "CASH" &&
                styles.selected,
            ]}
            onPress={() =>
              setPaymentMethod("CASH")
            }
          >
            <Text style={styles.vehicleName}>
              💵 Tiền mặt
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.vehicle,
              paymentMethod === "ONLINE" &&
                styles.selected,
            ]}
            onPress={() =>
              setPaymentMethod("ONLINE")
            }
          >
            <Text style={styles.vehicleName}>
              📱 QR / Online
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.createBtn}
            onPress={handleCreateTrip}
          >
            <Text style={styles.btnText}>
              🚕 ĐẶT XE NGAY
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  </View>
);

}

const styles = StyleSheet.create({
 inputBox: {
  position: "absolute",
  top: 0,
  left: 16,
  right: 16,
  backgroundColor: "#FFFFFF",
  paddingTop: 20,
  paddingHorizontal: 16,
  paddingBottom: 12,
  borderRadius: 24,
  zIndex: 10,
  elevation: 10,
},

 searchTitle: {
  fontSize: 17,
  fontWeight: "bold",
  color: "#0F172A",
  marginBottom: 12,
  marginLeft: 48,
},

  input: {
  backgroundColor: "#F8FAFC",
  paddingVertical: 10,
  paddingHorizontal: 16,
  borderRadius: 16,
  marginBottom: 8,
  borderWidth: 1,
  borderColor: "#E2E8F0",
  fontSize: 15,
},

  card: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    elevation: 20,
    maxHeight: "55%",
  },

  previewBtn: {
    backgroundColor: "#14B8A6",
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: "center",
  },

  createBtn: {
    backgroundColor: "#0F766E",
    paddingVertical: 18,
    borderRadius: 20,
    marginTop: 20,
    alignItems: "center",
  },

  btnText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.5,
  },

  tripInfo: {
    marginBottom: 18,
  },

  distance: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F172A",
  },

  sectionTitle: {
    marginTop: 10,
    marginBottom: 12,
    fontSize: 17,
    fontWeight: "bold",
    color: "#0F172A",
  },

  vehicle: {
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  selected: {
    backgroundColor: "#CCFBF1",
    borderColor: "#14B8A6",
  },

  vehicleName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },

  vehiclePrice: {
    marginTop: 4,
    color: "#0F766E",
    fontWeight: "bold",
  },

  check: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#14B8A6",
  },

  backButton: {
    position: "absolute",
    top: 0,
    left: 20,
    width: 52,
    height: 52,
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
    elevation: 10,
  },

  backText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0F172A",
  },
});