import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'; // Use Google Provider
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';

interface LocationPickerProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (location: { latitude: number; longitude: number; address?: string }) => void;
}

export default function LocationPicker({ visible, onClose, onConfirm }: LocationPickerProps) {
  const mapRef = useRef<MapView>(null);
  
  const [region, setRegion] = useState({
    latitude: 12.9716, // Default (Bangalore)
    longitude: 77.5946,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  // 1. Check Permission ONCE on mount
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      setHasLocationPermission(status === 'granted');
      if (status === 'granted') {
        getCurrentLocation(); // Pre-fetch location
      }
    })();
  }, []);

  // 2. Fetch Location efficiently
  const getCurrentLocation = async () => {
    if (!hasLocationPermission) {
       let { status } = await Location.requestForegroundPermissionsAsync();
       if (status !== 'granted') return;
       setHasLocationPermission(true);
    }

    setLoading(true);
    try {
      // Use 'balanced' accuracy for speed, 'highest' is too slow
      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = location.coords;
      
      const newRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.005, // Zoom in closer
        longitudeDelta: 0.005,
      };
      
      setRegion(newRegion);
      setSelectedLocation({ latitude, longitude });

      // Animate map to new location if it's already loaded
      mapRef.current?.animateToRegion(newRegion, 1000);

    } catch (error) {
      Alert.alert("Error", "Could not fetch location. Please select manually.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onConfirm(selectedLocation);
      onClose();
    } else {
      Alert.alert("Select a location", "Please tap on the map or use your current location.");
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <MaterialIcons name="close" size={24} color="#334155" />
          </TouchableOpacity>
          <Text style={styles.title}>Pin Shop Location</Text>
          <TouchableOpacity onPress={handleConfirm} style={styles.confirmBtn}>
            <Text style={styles.confirmText}>Confirm</Text>
          </TouchableOpacity>
        </View>

        {/* Map */}
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            region={region}
            provider={PROVIDER_GOOGLE} // Faster native map
            showsUserLocation={true}   // Show blue dot
            showsMyLocationButton={false} // We use our custom button
            onPress={(e) => setSelectedLocation(e.nativeEvent.coordinate)}
          >
            {selectedLocation && (
              <Marker coordinate={selectedLocation} title="Selected Location" pinColor="#2563eb" />
            )}
          </MapView>
          
          {/* Loading Indicator Overlay */}
          {loading && (
            <View style={styles.loaderOverlay}>
              <ActivityIndicator size="large" color="#2563eb" />
            </View>
          )}
          
          {/* Floating GPS Button */}
          <TouchableOpacity style={styles.gpsButton} onPress={getCurrentLocation}>
            <MaterialIcons name="my-location" size={24} color="#2563eb" />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {selectedLocation 
              ? `${selectedLocation.latitude.toFixed(6)}, ${selectedLocation.longitude.toFixed(6)}`
              : "Tap the map to pin your shop"}
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, paddingTop: 50, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', backgroundColor: '#fff', zIndex: 10 },
  title: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  confirmText: { color: '#2563eb', fontWeight: 'bold', fontSize: 16 },
  closeBtn: { padding: 5 },
  confirmBtn: { padding: 5 },
  
  mapContainer: { flex: 1, position: 'relative' },
  map: { width: '100%', height: '100%' },
  
  loaderOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 20 },
  
  gpsButton: { position: 'absolute', bottom: 30, right: 20, backgroundColor: 'white', padding: 15, borderRadius: 30, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, zIndex: 10 },
  
  footer: { padding: 20, alignItems: 'center', backgroundColor: '#f8fafc', borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  footerText: { color: '#64748b', fontWeight: '600' }
});