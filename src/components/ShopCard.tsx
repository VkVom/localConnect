import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Define the shape of a Shop object
export interface Shop {
  id: string;
  name: string;
  isOpen: boolean;
  address?: string; // Optional for now
}

interface ShopCardProps {
  shop: Shop;
}

export default function ShopCard({ shop }: ShopCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.shopName}>{shop.name}</Text>
        
        {/* Dynamic Badge based on status */}
        <View style={[
          styles.badge, 
          { backgroundColor: shop.isOpen ? '#e8f5e9' : '#ffebee' }
        ]}>
          <Text style={{
            color: shop.isOpen ? '#2e7d32' : '#c62828', 
            fontSize: 10, 
            fontWeight: 'bold'
          }}>
            {shop.isOpen ? "OPEN" : "CLOSED"}
          </Text>
        </View>
      </View>
      
      <Text style={styles.address}>
        {shop.address || "Local Shop • India"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 12, 
    marginBottom: 10, 
    shadowColor: '#000', 
    shadowOpacity: 0.05, 
    shadowRadius: 5, 
    elevation: 2 
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 5 
  },
  shopName: { fontSize: 16, fontWeight: '700', color: '#333' },
  badge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4 },
  address: { color: '#888', fontSize: 12 }
});