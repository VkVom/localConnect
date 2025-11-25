import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as Location from "expo-location";
import { Linking } from "react-native";
// ✅ Correct import
import { MaterialIcons } from "@expo/vector-icons";

interface LocationSelectModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (loc: { latitude: number; longitude: number }) => void;
}

export default function LocationSelectModal({
  visible,
  onClose,
  onSelect,
}: LocationSelectModalProps) {
  const [loading, setLoading] = useState(false);

  // Listen for shared coordinates
  useEffect(() => {
    const subscription = Linking.addEventListener("url", handleIncomingURL);

    return () => {
      subscription.remove();
    };
  }, []);

  const handleIncomingURL = (event: any) => {
    const url = event.url;

    if (!url.includes("geo:")) return;

    // Example geo URI:
    // geo:12.3456,77.1234
    try {
      const coords = url.replace("geo:", "").split(",");
      const lat = parseFloat(coords[0]);
      const lon = parseFloat(coords[1]);

      if (!isNaN(lat) && !isNaN(lon)) {
        onSelect({ latitude: lat, longitude: lon });
        Alert.alert("Location Selected", "Your location has been updated.");
        onClose();
      }
    } catch (err) {
      Alert.alert("Error", "Could not read location.");
    }
  };

  const useCurrentLocation = async () => {
    setLoading(true);

    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Needed", "Enable location access.");
      setLoading(false);
      return;
    }

    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      onSelect({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      onClose();
    } catch (err) {
      Alert.alert("Error", "Could not get current location.");
    }

    setLoading(false);
  };

  const openGoogleMaps = () => {
    Linking.openURL("geo:0,0?q=");

    Alert.alert(
      "How to Pick Location",
      "1) Google Maps will open\n" +
        "2) Long-press your shop location\n" +
        "3) Tap Share → Select this app\n" +
        "4) Location will be auto-filled",
      [{ text: "OK" }]
    );
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Select Shop Location</Text>

          {/* OPTION 1 — Current Location */}
          <TouchableOpacity
            style={styles.optionButton}
            onPress={useCurrentLocation}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <MaterialIcons name="my-location" size={22} color="white" />
                <Text style={styles.optionText}>Use Current Location</Text>
              </>
            )}
          </TouchableOpacity>

          {/* OPTION 2 — Pick on Map */}
          <View style={styles.divider} />

          <TouchableOpacity
            style={[styles.optionButton, { backgroundColor: "#f0f9ff" }]}
            onPress={openGoogleMaps}
          >
            <MaterialIcons name="map" size={22} color="#0369a1" />
            <Text style={[styles.optionText, { color: "#0369a1" }]}>
              Choose on Map (Google Maps)
            </Text>
          </TouchableOpacity>

          <Text style={styles.instructions}>
            You will be redirected to Google Maps. Long press → Share →
            choose this app.
          </Text>

          {/* Cancel Button */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Cancel</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 20,
    textAlign: "center",
  },
  optionButton: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 10,
    backgroundColor: "#2563eb",
  },
  optionText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 20,
  },
  instructions: {
    textAlign: "center",
    color: "#64748b",
    marginTop: 10,
    fontSize: 13,
    lineHeight: 18,
  },
  closeBtn: {
    marginTop: 20,
    alignItems: "center",
    paddingVertical: 10,
  },
  closeText: {
    color: "#ef4444",
    fontWeight: "700",
    fontSize: 16,
  },
});
