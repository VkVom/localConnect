// src/screens/shopkeeper/Dashboard.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { auth, db } from "../../config/firebase";
import { doc, onSnapshot, updateDoc, collection, query, where } from "firebase/firestore";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

export default function ShopkeeperDashboard({ navigation }: any) {
  const { user } = useAuth();

  // FIX: enforce non-null UID
  const uid = user?.uid ?? null;

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [forecast, setForecast] = useState("No prediction yet");
  const [stats, setStats] = useState({ transactions: 0, itemsSold: 0 });

  // Real-time shop data
  useEffect(() => {
    if (!uid) return;

    const shopRef = doc(db, "shops", uid);

    const unsubscribe = onSnapshot(
      shopRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setIsOpen(data.isOpen === true);

          if (data.aiForecast?.summary) {
            setForecast(String(data.aiForecast.summary));
          }
        }
        setLoading(false);
      },
      (err) => {
        console.log("shop realtime error", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [uid]);

  // Sales listener
  useEffect(() => {
    if (!uid) return;

    const q = query(collection(db, "sales"), where("uid", "==", uid));

    const unsubscribe = onSnapshot(q, (snap) => {
      let totalItems = 0;
      const totalTransactions = snap.size;

      snap.forEach((d) => {
        totalItems += d.data().quantity || 0;
      });

      setStats({
        transactions: totalTransactions,
        itemsSold: totalItems,
      });
    });

    return () => unsubscribe();
  }, [uid]);

  const toggleShop = async () => {
    if (!uid) return;

    try {
      const newVal = !isOpen;
      setIsOpen(newVal);
      await updateDoc(doc(db, "shops", uid), { isOpen: newVal });
    } catch (err) {
      Alert.alert("Error", "Could not update shop status");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.shopOwner}>{user?.email?.split("@")[0]}</Text>
        </View>

        <TouchableOpacity
          onPress={() => auth.signOut()}
          style={styles.logoutButton}
        >
          <MaterialIcons name="logout" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>

      {/* STATUS */}
      <View
        style={[
          styles.statusCard,
          isOpen ? styles.statusOpen : styles.statusClosed,
        ]}
      >
        <View style={styles.statusTextContainer}>
          <Text
            style={[
              styles.statusLabel,
              isOpen ? styles.textOpen : styles.textClosed,
            ]}
          >
            STORE STATUS
          </Text>

          <Text
            style={[
              styles.statusValue,
              isOpen ? styles.textOpen : styles.textClosed,
            ]}
          >
            {isOpen ? "OPEN" : "CLOSED"}
          </Text>
        </View>

        <TouchableOpacity
          onPress={toggleShop}
          style={[
            styles.toggleButton,
            isOpen ? styles.btnOpen : styles.btnClose,
          ]}
        >
          <FontAwesome5
            name={isOpen ? "door-closed" : "door-open"}
            size={20}
            color={isOpen ? "#15803d" : "#b91c1c"}
          />
          <Text
            style={[
              styles.toggleText,
              isOpen ? styles.textOpen : styles.textClosed,
            ]}
          >
            {isOpen ? "CLOSE" : "OPEN"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>

      <View style={styles.grid}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate("SalesLog")}
        >
          <View style={[styles.iconCircle, { backgroundColor: "#dbeafe" }]}>
            <MaterialIcons name="playlist-add" size={28} color="#2563eb" />
          </View>
          <Text style={styles.actionTitle}>Log Sales</Text>
          <Text style={styles.actionSubtitle}>Record daily transactions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate("Forecast")}
        >
          <View style={[styles.iconCircle, { backgroundColor: "#fce7f3" }]}>
            <MaterialIcons name="trending-up" size={28} color="#db2777" />
          </View>
          <Text style={styles.actionTitle}>Forecast</Text>
          <Text style={styles.actionSubtitle}>
            {forecast.substring(0, 18)}...
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate("Inventory")}
        >
          <View style={[styles.iconCircle, { backgroundColor: "#d1fae5" }]}>
            <MaterialIcons name="inventory" size={28} color="#059669" />
          </View>
          <Text style={styles.actionTitle}>Inventory</Text>
          <Text style={styles.actionSubtitle}>Manage products</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <Text style={styles.sectionTitle}>Performance Overview</Text>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.transactions}</Text>
          <Text style={styles.statLabel}>Transactions</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.itemsSold}</Text>
          <Text style={styles.statLabel}>Units Sold</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statItem}>
          <Text style={styles.statValue}>--</Text>
          <Text style={styles.statLabel}>Revenue</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8fafc" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 45,
    marginBottom: 30,
    alignItems: "center",
  },
  greeting: { fontSize: 16, color: "#64748b" },
  shopOwner: { fontSize: 24, fontWeight: "800", color: "#0f172a" },
  logoutButton: {
    padding: 8,
    backgroundColor: "#fee2e2",
    borderRadius: 12,
  },

  statusCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 30,
  },
  statusOpen: { backgroundColor: "#dcfce7", borderColor: "#86efac" },
  statusClosed: { backgroundColor: "#fee2e2", borderColor: "#fca5a5" },
  statusTextContainer: { flex: 1 },

  statusLabel: { fontSize: 12, fontWeight: "700" },
  statusValue: { fontSize: 34, fontWeight: "900" },

  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  btnOpen: { backgroundColor: "#bbf7d0" },
  btnClose: { backgroundColor: "#fecaca" },
  toggleText: { fontWeight: "800" },

  textOpen: { color: "#15803d" },
  textClosed: { color: "#b91c1c" },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 15,
  },

  grid: { flexDirection: "row", gap: 15, marginBottom: 30 },

  actionCard: {
    flex: 1,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 16,
    elevation: 2,
  },

  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  actionTitle: { fontSize: 16, fontWeight: "700" },
  actionSubtitle: { fontSize: 12, color: "#64748b" },

  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    marginBottom: 40,
  },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 20, fontWeight: "800" },
  statLabel: { fontSize: 12, color: "#64748b" },
  divider: { width: 1, backgroundColor: "#e2e8f0" },
});
