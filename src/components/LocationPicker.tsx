import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker, UrlTile } from "react-native-maps";
import * as Location from "expo-location";
import { MaterialIcons } from "@expo/vector-icons";

interface LocationPickerProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (location: { latitude: number; longitude: number }) => void;
}

export default function LocationPicker({
  visible,
  onClose,
  onConfirm,
}: LocationPickerProps) {
  const mapRef = useRef<MapView>(null);

  const [region, setRegion] = useState({
    latitude: 20.5937, // India center
    longitude: 78.9629,
    latitudeDelta: 8,
    longitudeDelta: 8,
  });

  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) getUserLocation();
  }, [visible]);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      setLoading(true);

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = loc.coords;

      const newRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setRegion(newRegion);
      setSelectedLocation({ latitude, longitude });

      mapRef.current?.animateToRegion(newRegion, 1000);
    } catch (e) {
      Alert.alert("Error", "Could not fetch your location.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!selectedLocation) {
      return Alert.alert("Select Location", "Tap on the map to pin your shop.");
    }
    onConfirm(selectedLocation);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="close" size={26} color="#111" />
          </TouchableOpacity>

          <Text style={styles.title}>Pin Shop Location</Text>

          <TouchableOpacity onPress={handleConfirm}>
            <Text style={styles.confirmText}>Confirm</Text>
          </TouchableOpacity>
        </View>

        {/* MAP */}
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            region={region}
            onPress={(e) => setSelectedLocation(e.nativeEvent.coordinate)}
          >
            {/* ⭐ OSM TILE LAYER */}
            <UrlTile
              urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              maximumZ={19}
              tileSize={256}
            />

            {selectedLocation && (
              <Marker coordinate={selectedLocation} pinColor="#2563eb" />
            )}
          </MapView>

          {loading && (
            <View style={styles.loaderOverlay}>
              <ActivityIndicator size="large" color="#2563eb" />
            </View>
          )}

          <TouchableOpacity style={styles.gpsButton} onPress={getUserLocation}>
            <MaterialIcons name="my-location" size={24} color="#2563eb" />
          </TouchableOpacity>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {selectedLocation
              ? `${selectedLocation.latitude.toFixed(6)}, ${selectedLocation.longitude.toFixed(6)}`
              : "Tap anywhere on the map to drop a pin"}
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },

  header: {
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: { fontSize: 18, fontWeight: "700", color: "#111" },

  confirmText: { fontSize: 16, fontWeight: "700", color: "#2563eb" },

  mapContainer: { flex: 1 },
  map: { width: "100%", height: "100%" },

  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.4)",
  },

  gpsButton: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: "white",
    padding: 14,
    borderRadius: 30,
    elevation: 4,
  },

  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    alignItems: "center",
  },

  footerText: {
    color: "#64748b",
    fontWeight: "600",
  },
});
