import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native";

import { auth, db } from "../../config/firebase";
import { collection, onSnapshot } from "firebase/firestore";

import ShopCard, { Shop } from "../../components/ShopCard";

import MapView, { Marker, UrlTile } from "react-native-maps";
import * as Location from "expo-location";
import Constants from "expo-constants";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const MAPTILER_KEY = Constants.expoConfig?.extra?.MAPTILER_KEY;

interface ShopWithLoc extends Shop {
  latitude?: number;
  longitude?: number;
  distance?: number;
}

export default function CustomerHome() {
  const navigation = useNavigation<any>();

  const [shops, setShops] = useState<ShopWithLoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapVisible, setMapVisible] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Request Location
  useEffect(() => {
    const getLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Location permission is required to show nearby shops.");
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

  const calcDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
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

  // Realtime shops listener
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

      list.sort((a, b) => (a.distance ?? 9999) - (b.distance ?? 9999));

      setShops(list);
      setLoading(false);
    });

    return () => unsub();
  }, [userLocation]);

  if (!MAPTILER_KEY) {
    return (
      <View style={styles.loader}>
        <Text style={{ color: "red" }}>❗ MAPTILER_KEY missing in app.json</Text>
      </View>
    );
  }

  if (loading || !userLocation) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Nearby Shops</Text>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 18 }}>
          <TouchableOpacity onPress={() => setMapVisible(true)}>
            <MaterialIcons name="map" size={28} color="#007AFF" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => auth.signOut()}>
            <MaterialIcons name="logout" size={28} color="red" />
          </TouchableOpacity>
        </View>
      </View>

      {/* SHOP LIST */}
      <FlatList
        data={shops}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ShopCard
            shop={item}
            onPress={() => navigation.navigate("ShopDetails" as never, { shop: item } as never)}
          />
        )}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      />

      {/* MAP MODAL */}
      <Modal visible={mapVisible} animationType="slide">
        <View style={{ flex: 1 }}>
          <MapView
            style={{ flex: 1 }}
            initialRegion={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
              latitudeDelta: 0.04,
              longitudeDelta: 0.04,
            }}
          >
            <UrlTile
              urlTemplate={`https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`}
              maximumZ={20}
              tileSize={512}
            />

            <Marker coordinate={userLocation} pinColor="blue" title="You" />

            {shops.map((shop) =>
              shop.latitude && shop.longitude ? (
                <Marker
                  key={shop.id}
                  coordinate={{ latitude: shop.latitude, longitude: shop.longitude }}
                  title={shop.name}
                  description={shop.isOpen ? "Open Now" : "Closed"}
                  pinColor={shop.isOpen ? "green" : "red"}
                />
              ) : null
            )}
          </MapView>

          <TouchableOpacity style={styles.closeMapBtn} onPress={() => setMapVisible(false)}>
            <MaterialIcons name="close" size={28} color="white" />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: { fontSize: 22, fontWeight: "700", color: "#111" },

  closeMapBtn: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "black",
    padding: 10,
    borderRadius: 40,
  },
});
