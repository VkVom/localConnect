import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Linking, 
  Alert 
} from 'react-native';

import { db } from '../../config/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import ReviewModal from '../../components/ReviewModal';
import { Review } from '../../types/review';

export default function ShopDetails() {
  const route = useRoute();
  const navigation = useNavigation();

  const { shop }: any = route.params;

  const [products, setProducts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);

  // --------------------------
  // CALL SHOP OWNER
  // --------------------------
  const callShop = () => {
    if (!shop.phone) {
      Alert.alert("Phone number not available");
      return;
    }
    Linking.openURL(`tel:${shop.phone}`);
  };

  // --------------------------
  // GET DIRECTIONS
  // --------------------------
  const openDirections = () => {
    if (!shop.latitude || !shop.longitude) {
      Alert.alert("Location not available for this shop.");
      return;
    }

    const url = `https://www.google.com/maps/dir/?api=1&destination=${shop.latitude},${shop.longitude}`;
    Linking.openURL(url);
  };

  // Listen to Products
  useEffect(() => {
    const q = query(collection(db, 'products'), where("shopId", "==", shop.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(list);
    });
    return () => unsubscribe();
  }, [shop.id]);

  // Listen to Reviews
  useEffect(() => {
    const q = query(collection(db, `shops/${shop.id}/reviews`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
      setReviews(list);
    });
    return () => unsubscribe();
  }, [shop.id]);

  return (
    <View style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>

        <Text style={styles.shopName}>{shop.name}</Text>

        <View style={[
          styles.badge, 
          { backgroundColor: shop.isOpen ? '#dcfce7' : '#fee2e2' }
        ]}>
          <Text style={{ 
            color: shop.isOpen ? '#15803d' : '#b91c1c', 
            fontWeight: 'bold', 
            fontSize: 12 
          }}>
            {shop.isOpen ? "OPEN NOW" : "CLOSED"}
          </Text>
        </View>
      </View>

      {/* CONTENT */}
      <View style={styles.content}>

        <View style={styles.infoRow}>
          <Text style={styles.distance}>
            {shop.distance ? `${shop.distance.toFixed(1)} km away` : "Nearby"}
          </Text>

          <TouchableOpacity onPress={callShop}>
            <MaterialIcons name="phone" size={26} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* GET DIRECTIONS */}
        <TouchableOpacity style={styles.directionBtn} onPress={openDirections}>
          <MaterialIcons name="directions" size={20} color="white" />
          <Text style={styles.directionText}>Get Directions</Text>
        </TouchableOpacity>

        {/* PRODUCTS */}
        <Text style={styles.sectionTitle}>Available Products</Text>

        <FlatList
          data={products}
          keyExtractor={i => i.id}
          ListEmptyComponent={<Text style={styles.emptyText}>No products listed yet.</Text>}
          
          renderItem={({ item }) => (
            <View
              style={[
                styles.productCard,
                item.outOfStock && styles.cardOut
              ]}
            >
              <View>
                <Text style={[
                  styles.prodName,
                  item.outOfStock && styles.textOut
                ]}>
                  {item.name}
                </Text>

                <Text style={styles.prodCategory}>
                  {item.category || 'General'}
                </Text>

                {item.outOfStock && (
                  <Text style={styles.outOfStockLabel}>OUT OF STOCK</Text>
                )}
              </View>

              {!item.outOfStock && (
                <Text style={styles.prodPrice}>₹{item.price}</Text>
              )}
            </View>
          )}

          ListFooterComponent={
            <View style={styles.reviewsContainer}>
              <View style={styles.reviewHeader}>
                <Text style={styles.sectionTitle}>Reviews</Text>
                <TouchableOpacity onPress={() => setReviewModalVisible(true)}>
                  <Text style={styles.writeReviewText}>Write Review</Text>
                </TouchableOpacity>
              </View>

              {reviews.length === 0 ? (
                <Text style={styles.emptyText}>No reviews yet. Be the first!</Text>
              ) : (
                reviews.map(review => (
                  <View key={review.id} style={styles.reviewCard}>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                      <Text style={{fontWeight: 'bold'}}>{review.userName}</Text>
                      <View style={{flexDirection: 'row'}}>
                        <Text style={{marginRight: 4}}>{review.rating}</Text>
                        <MaterialIcons name="star" size={16} color="#fbbf24" />
                      </View>
                    </View>
                    <Text style={{color: '#64748b', marginTop: 5}}>
                      {review.comment}
                    </Text>
                  </View>
                ))
              )}
            </View>
          }
        />
      </View>

      <ReviewModal
        visible={reviewModalVisible}
        onClose={() => setReviewModalVisible(false)}
        shopId={shop.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },

  header: { backgroundColor: '#0f172a', padding: 20, paddingTop: 60, paddingBottom: 30 },
  backBtn: { marginBottom: 15 },
  shopName: { fontSize: 28, fontWeight: 'bold', color: 'white', marginBottom: 10 },
  
  badge: { alignSelf: 'flex-start', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },

  content: { flex: 1, padding: 20, marginTop: -20, backgroundColor: '#f8fafc', borderTopLeftRadius: 24, borderTopRightRadius: 24 },

  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  distance: { fontSize: 16, color: '#64748b', fontWeight: '600' },

  directionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  directionText: { color: "white", fontWeight: "600", marginLeft: 8 },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#334155', marginBottom: 15 },
  
  productCard: { padding: 16, backgroundColor: 'white', borderRadius: 12, marginBottom: 10 },
  prodName: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  prodCategory: { fontSize: 12, color: '#94a3b8' },
  prodPrice: { fontSize: 16, fontWeight: '700', color: '#2563eb', marginTop: 8 },

  // New Out of Stock styles
  textOut: { color: "#9ca3af" },
  cardOut: { opacity: 0.6, backgroundColor: "#f3f4f6" },
  outOfStockLabel: { marginTop: 8, color: "#b91c1c", fontWeight: "700" },

  emptyText: { textAlign: 'center', color: '#94a3b8', marginTop: 20, marginBottom: 20 },

  reviewsContainer: { marginTop: 30, paddingBottom: 40 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  writeReviewText: { color: '#2563eb', fontWeight: 'bold' },
  reviewCard: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 10 },
});
