import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

export default function DriverTrip() {
const [trip, setTrip] = useState<any>(null);
const [location, setLocation] = useState<any>(null);

// ===== FETCH TRIP =====
const fetchTrip = async () => {
try {
const token = await AsyncStorage.getItem("token");


  const res = await axios.get(
    "http://192.168.1.50:8080/trips/driver/my-trip",
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  setTrip(res.data[0]);

  // set vị trí ban đầu = pickup (để không bị null)
  if (!location && res.data[0]) {
    setLocation({
      latitude: res.data[0].pickupLatitude,
      longitude: res.data[0].pickupLongitude,
    });
  }

} catch (err) {
  console.log("FETCH TRIP ERROR:", err);
}


};

// ===== INIT =====
useEffect(() => {
fetchTrip();
const interval = setInterval(fetchTrip, 3000);
return () => clearInterval(interval);
}, []);

if (!trip || !location) {
return ( <View style={styles.center}> <Text>Loading...</Text> </View>
);
}

// ===== DESTINATION =====
const destination =
trip.status === "ACCEPTED" || trip.status === "PICKUP"
? {
latitude: trip.pickupLatitude,
longitude: trip.pickupLongitude,
}
: {
latitude: trip.dropoffLatitude,
longitude: trip.dropoffLongitude,
};

// ===== API =====
const callApi = async (url: string) => {
try {
const token = await AsyncStorage.getItem("token");


  await axios.post(
    `http://192.168.1.50:8080${url}`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  fetchTrip();
} catch (err: any) {
  console.log(err.response || err);
  alert(err.response?.data || err.message);
}


};

// ===== ACTIONS =====
const handleGoPickup = () => callApi(`/trips/${trip.id}/start`);
const handlePicked = () => callApi(`/trips/${trip.id}/pickup`);
const handleComplete = () => callApi(`/trips/${trip.id}/complete`);

// ===== TELEPORT (TEST) =====
const goToPickup = () => {
setLocation({
latitude: trip.pickupLatitude,
longitude: trip.pickupLongitude,
});
};

const goToDropoff = () => {
setLocation({
latitude: trip.dropoffLatitude,
longitude: trip.dropoffLongitude,
});
};

return ( <View style={styles.container}>
{/* ===== MAP ===== */}
<MapView
style={StyleSheet.absoluteFillObject}
region={{
latitude: location.latitude,
longitude: location.longitude,
latitudeDelta: 0.01,
longitudeDelta: 0.01,
}}
>
{/* 🚕 Driver */} <Marker coordinate={location} title="Driver" />


    {/* 📍 Destination */}
    <Marker coordinate={destination} title="Điểm đến" />
  </MapView>

  {/* ===== UI ===== */}
  <View style={styles.bottom}>
    <Text style={styles.title}>🚕 Driver Trip</Text>

    <Text>Status: {trip.status}</Text>
    <Text>📍 {trip.pickupAddress}</Text>
    <Text>🏁 {trip.dropoffAddress}</Text>

    {/* ===== BUTTON FLOW ===== */}
    {trip.status === "ACCEPTED" && (
      <TouchableOpacity style={styles.button} onPress={handleGoPickup}>
        <Text style={styles.buttonText}>🚕 ĐI ĐÓN KHÁCH</Text>
      </TouchableOpacity>
    )}

    {trip.status === "PICKUP" && (
      <TouchableOpacity style={styles.button} onPress={handlePicked}>
        <Text style={styles.buttonText}>✅ ĐÃ ĐÓN KHÁCH</Text>
      </TouchableOpacity>
    )}

    {trip.status === "IN_PROGRESS" && (
      <TouchableOpacity style={styles.button} onPress={handleComplete}>
        <Text style={styles.buttonText}>🏁 HOÀN THÀNH</Text>
      </TouchableOpacity>
    )}

    {/* ===== TEST BUTTON ===== */}
    <TouchableOpacity style={styles.testBtn} onPress={goToPickup}>
      <Text>🚀 ĐẾN PICKUP</Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.testBtn} onPress={goToDropoff}>
      <Text>🏁 ĐẾN DROPOFF</Text>
    </TouchableOpacity>

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
borderTopLeftRadius: 20,
borderTopRightRadius: 20,
},

title: {
fontSize: 18,
fontWeight: "bold",
marginBottom: 10,
},

button: {
marginTop: 10,
backgroundColor: "#000",
padding: 15,
borderRadius: 10,
alignItems: "center",
},

buttonText: {
color: "#fff",
fontWeight: "bold",
},

testBtn: {
marginTop: 10,
backgroundColor: "#ddd",
padding: 10,
borderRadius: 10,
alignItems: "center",
},
});
