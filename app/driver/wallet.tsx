import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const BASE_URL = "http://192.168.0.103:8080";

export default function DriverWallet() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [balance, setBalance] = useState(0);

  const [transactions, setTransactions] = useState<any[]>([]);

  const [topupAmount, setTopupAmount] = useState("");

  // ================= INIT =================
  useEffect(() => {
    fetchWallet();
    fetchTransactions();
  }, []);

  // ================= WALLET =================
  const fetchWallet = async () => {
    const token = await AsyncStorage.getItem("token");

    try {
      const res = await axios.get(`${BASE_URL}/driver/wallet`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setBalance(res.data.balance || 0);
    } catch (err) {
      console.log("❌ WALLET ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  // ================= TRANSACTIONS =================
  const fetchTransactions = async () => {
    const token = await AsyncStorage.getItem("token");

    try {
      const res = await axios.get(
        `${BASE_URL}/driver/wallet/transactions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTransactions(res.data);
    } catch (err) {
      console.log("❌ TRANSACTION ERROR:", err);
    }
  };

  // ================= TOPUP =================
 const handleTopup = async () => {
  if (!topupAmount) {
    alert("Nhập số tiền");
    return;
  }

  const token = await AsyncStorage.getItem("token");

  try {

    // 🔥 1. tạo topup request
    const res = await axios.post(
      `${BASE_URL}/driver/wallet/topup`,
      {
        amount: Number(topupAmount),
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("TOPUP URL:", res.data);

    // 🔥 lấy txnRef từ url fake vnpay
    const url = res.data;

    const txnRef = url.split("txnRef=")[1];

    // 🔥 2. fake callback success
    await axios.get(
      `${BASE_URL}/payments/fake-success`,
      {
        params: {
          txnRef: txnRef,
        },
      }
    );

    // 🔥 3. reload wallet
    await fetchWallet();

    // 🔥 4. reload transaction
    await fetchTransactions();

    // 🔥 5. clear input
    setTopupAmount("");

    alert("Nạp tiền thành công 🚀");

  } catch (err) {

    console.log("❌ TOPUP ERROR:", err);

    alert("Lỗi topup");
  }
};
  // ================= NAVIGATION =================
  const handleBack = () => {
    router.back();
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("role");

    router.replace("/login");
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text>Đang tải ví...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* ================= HEADER ================= */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* ================= WALLET CARD ================= */}
      <View style={styles.card}>
        <Text style={styles.title}>💰 Ví tài xế</Text>

        <Text style={styles.balance}>
          {balance.toLocaleString()} VND
        </Text>

        <Text style={styles.sub}>
          * Bao gồm thu nhập và commission
        </Text>
      </View>

      {/* ================= TOPUP ================= */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💳 Nạp tiền</Text>

        <TextInput
          placeholder="Nhập số tiền"
          keyboardType="numeric"
          value={topupAmount}
          onChangeText={setTopupAmount}
          style={styles.input}
        />

        <TouchableOpacity
          style={styles.topupBtn}
          onPress={handleTopup}
        >
          <Text style={styles.topupText}>
            🚀 Nạp tiền với VNPay
          </Text>
        </TouchableOpacity>
      </View>

      {/* ================= TRANSACTIONS ================= */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          📊 Lịch sử giao dịch
        </Text>

        {transactions.length === 0 && (
          <Text style={{ marginTop: 10 }}>
            Chưa có giao dịch
          </Text>
        )}

        {transactions.map((item: any) => (
          <View key={item.id} style={styles.transaction}>
            <View>
              <Text style={styles.txDesc}>
                {item.description}
              </Text>

              <Text style={styles.txDate}>
                {item.createdAt}
              </Text>
            </View>

            <Text
              style={[
                styles.txAmount,
                {
                  color:
                    item.type === "CREDIT"
                      ? "green"
                      : "red",
                },
              ]}
            >
              {item.type === "CREDIT" ? "+" : "-"}
              {item.amount?.toLocaleString()}đ
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles: any = {
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  back: {
    color: "blue",
    fontSize: 16,
  },

  logout: {
    color: "red",
    fontSize: 16,
  },

  card: {
    backgroundColor: "#000",
    borderRadius: 20,
    padding: 25,
  },

  title: {
    color: "#fff",
    fontSize: 18,
  },

  balance: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 10,
  },

  sub: {
    color: "#aaa",
    marginTop: 10,
  },

  section: {
    marginTop: 30,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },

  input: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
  },

  topupBtn: {
    marginTop: 10,
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  topupText: {
    color: "#fff",
    fontWeight: "bold",
  },

  transaction: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  txDesc: {
    fontWeight: "bold",
  },

  txDate: {
    color: "#777",
    fontSize: 12,
    marginTop: 3,
  },

  txAmount: {
    fontWeight: "bold",
    fontSize: 16,
  },
};