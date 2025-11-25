import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// Main Shop type
export interface Shop {
  id: string;
  name: string;
  isOpen: boolean;
  latitude?: number;
  longitude?: number;
  distance?: number;
}

export interface ShopCardProps {
  shop: Shop;
  onPress?: () => void;
}

export default function ShopCard({ shop, onPress }: ShopCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>

      <View style={{ flex: 1 }}>
        {/* SHOP NAME */}
        <Text style={styles.name}>{shop.name}</Text>

        {/* OPEN / CLOSED BADGE */}
        <View
          style={[
            styles.badge,
            { backgroundColor: shop.isOpen ? "#dcfce7" : "#fee2e2" }
          ]}
        >
          <Text
            style={{
              color: shop.isOpen ? "#15803d" : "#b91c1c",
              fontWeight: "bold",
              fontSize: 12,
            }}
          >
            {shop.isOpen ? "OPEN" : "CLOSED"}
          </Text>
        </View>

        {/* DISTANCE */}
        {shop.distance !== undefined && (
          <Text style={styles.distance}>{shop.distance.toFixed(1)} km away</Text>
        )}
      </View>

      <MaterialIcons name="chevron-right" size={28} color="#888" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    padding: 16,
    marginBottom: 12,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },
  badge: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  distance: {
    marginTop: 6,
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
  },
});
