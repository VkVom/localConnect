import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Modal, Dimensions, Alert } from 'react-native';
import { auth, db } from '../../config/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import ShopCard, { Shop } from '../../components/ShopCard';
import MapView, { Marker, UrlTile } from 'react-native-maps'; // Added UrlTile
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Extend Shop to include location
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
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);

  // Helper: Calculate Distance (Haversine Formula)
  const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    var R = 6371; 
    var dLat = deg2rad(lat2 - lat1);
    var dLon = deg2rad(lon2 - lon1);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return parseFloat(d.toFixed(1));
  };

  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
  };

  // 1. Get User Location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Allow location access to find nearby shops.');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation(location);
    })();
  }, []);

  // 2. Fetch and Sort Shops
  useEffect(() => {
    const shopsRef = collection(db, 'shops');
    const unsubscribe = onSnapshot(shopsRef, (snapshot) => {
      const shopList: ShopWithLoc[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        let dist = 0;

        if (userLocation && data.latitude && data.longitude) {
          dist = getDistanceFromLatLonInKm(
            userLocation.coords.latitude,
            userLocation.coords.longitude,
            data.latitude,
            data.longitude
          );
        }

        shopList.push({ 
          id: doc.id, 
          ...data,
          distance: dist
        } as ShopWithLoc);
      });

      if (userLocation) {
        shopList.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      }

      setShops(shopList);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [userLocation]); 

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>LocalConnect</Text>
        <View style={{flexDirection: 'row', gap: 15}}>
          <TouchableOpacity onPress={() => setMapVisible(true)} style={styles.iconBtn}>
            <MaterialIcons name="map" size={24} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => auth.signOut()} style={styles.iconBtn}>
            <MaterialIcons name="logout" size={24} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Nearby Shops</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <FlatList
          data={shops}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              activeOpacity={0.9}
              onPress={() => navigation.navigate('ShopDetails', { shop: item })}
            >
              <ShopCard shop={item} />
              {/* Show Distance Badge */}
              {item.distance ? (
                <View style={styles.distBadge}>
                  <Text style={styles.distText}>{item.distance} km away</Text>
                </View>
              ) : null}
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.list}
        />
      )}

      {/* THE MAP MODAL */}
      <Modal visible={mapVisible} animationType="slide">
        <View style={styles.mapContainer}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => setMapVisible(false)}>
            <MaterialIcons name="close" size={24} color="black" />
            <Text style={styles.closeText}>Close Map</Text>
          </TouchableOpacity>
          
          <MapView 
            style={styles.map}
            showsUserLocation={true}
            initialRegion={{
              latitude: userLocation?.coords.latitude || 12.9716,
              longitude: userLocation?.coords.longitude || 77.5946,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            {/* OpenStreetMap Tile Layer */}
            <UrlTile
              urlTemplate="http://c.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maximumZ={19}
              flipY={false}
            />

            {shops.map((shop) => (
              shop.latitude && shop.longitude ? (
                <Marker
                  key={shop.id}
                  coordinate={{
                    latitude: shop.latitude,
                    longitude: shop.longitude
                  }}
                  title={shop.name}
                  description={shop.isOpen ? "Open Now" : "Closed"}
                  // Removed pinColor as it's Google specific, using default red pin
                  onCalloutPress={() => {
                    setMapVisible(false);
                    navigation.navigate('ShopDetails', { shop: shop });
                  }}
                />
              ) : null
            ))}
          </MapView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '800', color: '#333' },
  iconBtn: { padding: 5 },
  list: { paddingBottom: 20, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 15, color: '#555', paddingHorizontal: 20 },
  
  mapContainer: { flex: 1 },
  map: { width: Dimensions.get('window').width, height: Dimensions.get('window').height },
  closeBtn: { position: 'absolute', top: 50, left: 20, zIndex: 1, backgroundColor: 'white', padding: 10, borderRadius: 25, flexDirection: 'row', alignItems: 'center', gap: 5, elevation: 5 },
  closeText: { fontWeight: 'bold' },

  distBadge: { position: 'absolute', right: 10, top: 10, backgroundColor: 'rgba(0,0,0,0.05)', padding: 5, borderRadius: 5 },
  distText: { fontSize: 10, fontWeight: 'bold', color: '#555' }
});
