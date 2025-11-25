import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";

import { auth, db } from "../../config/firebase";
import { collection, onSnapshot } from "firebase/firestore";

import ShopCard, { Shop } from "../../components/ShopCard";

import * as Location from "expo-location";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ShopWithLoc extends Shop {
  latitude?: number;
  longitude?: number;
  distance?: number;
}

export default function CustomerHome() {
  const navigation = useNavigation<any>();

  const [shops, setShops] = useState<ShopWithLoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Request Location Permission
  useEffect(() => {
    const getLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Location permission is required to show nearby shops."
        );
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    };

    getLocation();
  }, []);

  // Calculate Distance
  const calcDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;

    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  // Fetch shops
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "shops"), (snap) => {
      const list: ShopWithLoc[] = [];

      snap.forEach((doc) => {
        const data = doc.data() as ShopWithLoc;

        if (userLocation && data.latitude && data.longitude) {
          data.distance = calcDistance(
            userLocation.latitude,
            userLocation.longitude,
            data.latitude,
            data.longitude
          );
        }

        list.push({ ...data, id: doc.id });
      });

      list.sort(
        (a, b) => (a.distance ?? 9999) - (b.distance ?? 9999)
      );

      setShops(list);
      setLoading(false);
    });

    return () => unsub();
  }, [userLocation]);

  if (loading || !userLocation) {
    return (
      <SafeAreaView style={styles.loader}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Nearby Shops</Text>

        <TouchableOpacity onPress={() => auth.signOut()} style={styles.logoutBtn}>
          <MaterialIcons name="logout" size={20} color="#d9534f" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* SHOP LIST */}
      <FlatList
        data={shops}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ShopCard
            shop={item}
            onPress={() =>
              navigation.navigate(
                "ShopDetails" as never,
                { shop: item } as never
              )
            }
          />
        )}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  title: { 
    fontSize: 24, 
    fontWeight: "700", 
    color: "#111" 
  },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#f8d7da",
    borderRadius: 8,
  },

  logoutText: {
    color: "#d9534f",
    fontWeight: "600",
    marginLeft: 6,
    fontSize: 14,
  },
});
