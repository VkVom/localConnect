import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { auth, db } from '../../config/firebase';
import { doc, onSnapshot, updateDoc, collection, query, where } from 'firebase/firestore';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons'; 

export default function ShopkeeperDashboard(props: any) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [forecast, setForecast] = useState("No prediction yet");

  
  // New State for Stats
  const [stats, setStats] = useState({ transactions: 0, itemsSold: 0 });

  // 1. Listen to Shop Status
  useEffect(() => {
    if (!user?.uid) return;
    const shopRef = doc(db, 'shops', user.uid);
    const unsubscribe = onSnapshot(shopRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        setIsOpen(data.isOpen);
        if (data.aiForecast) setForecast(data.aiForecast); // <--- READ AI DATA
      }
      setLoading(false);

      

      
    });


    
    return () => unsubscribe();
  }, [user?.uid]);

  // 2. Listen to Sales Data (NEW)
  useEffect(() => {
    if (!user?.uid) return;

    // Query all sales by this user
    const q = query(collection(db, 'sales'), where("uid", "==", user.uid));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let totalItems = 0;
      const totalTransactions = querySnapshot.size;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        totalItems += (data.quantity || 0);
      });

      setStats({
        transactions: totalTransactions,
        itemsSold: totalItems
      });
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const toggleShop = async () => {
    if (!user?.uid || isOpen === null) return;
    const newValue = !isOpen;
    setIsOpen(newValue);
    try {
      await updateDoc(doc(db, 'shops', user.uid), { isOpen: newValue });
    } catch (error) {
      Alert.alert("Error", "Failed to update status");
      setIsOpen(!newValue);
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
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.shopOwner}>{user?.email?.split('@')[0]}</Text>
        </View>
        <TouchableOpacity onPress={() => auth.signOut()} style={styles.logoutButton}>
          <MaterialIcons name="logout" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>

      {/* Status Card */}
      <View style={[styles.statusCard, isOpen ? styles.statusOpen : styles.statusClosed]}>
        <View style={styles.statusTextContainer}>
          <Text style={[styles.statusLabel, isOpen ? styles.textOpen : styles.textClosed]}>
            STORE STATUS
          </Text>
          <Text style={[styles.statusValue, isOpen ? styles.textOpen : styles.textClosed]}>
            {isOpen ? "OPEN" : "CLOSED"}
          </Text>
        </View>
        <TouchableOpacity 
          style={[styles.toggleButton, isOpen ? styles.btnOpen : styles.btnClose]}
          onPress={toggleShop}
        >
          <FontAwesome5 name={isOpen ? "door-closed" : "door-open"} size={20} color={isOpen ? "#15803d" : "#b91c1c"} />
          <Text style={[styles.toggleText, isOpen ? styles.textOpen : styles.textClosed]}>
            {isOpen ? "CLOSE" : "OPEN"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.grid}>
        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => props.navigation.navigate('SalesLog')}
        >
          <View style={[styles.iconCircle, { backgroundColor: '#dbeafe' }]}>
            <MaterialIcons name="playlist-add" size={28} color="#2563eb" />
          </View>
          <Text style={styles.actionTitle}>Log Sales</Text>
          <Text style={styles.actionSubtitle}>Record daily transactions</Text>
        </TouchableOpacity>

       <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => Alert.alert("AI Forecast", forecast)}
        >
          <View style={[styles.iconCircle, { backgroundColor: '#fce7f3' }]}>
            <MaterialIcons name="trending-up" size={28} color="#db2777" />
          </View>
          <Text style={styles.actionTitle}>Forecast</Text>
          <Text style={styles.actionSubtitle}>{forecast.substring(0, 15)}...</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => props.navigation.navigate('Inventory')}
        >
          <View style={[styles.iconCircle, { backgroundColor: '#d1fae5' }]}>
            <MaterialIcons name="inventory" size={28} color="#059669" />
          </View>
          <Text style={styles.actionTitle}>Inventory</Text>
          <Text style={styles.actionSubtitle}>Manage products</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Preview (UPDATED) */}
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
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 40, marginBottom: 30 },
  greeting: { fontSize: 16, color: '#64748b' },
  shopOwner: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  logoutButton: { padding: 8, backgroundColor: '#fee2e2', borderRadius: 12 },
  
  statusCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderRadius: 20, borderWidth: 1, marginBottom: 30 },
  statusOpen: { backgroundColor: '#dcfce7', borderColor: '#86efac' },
  statusClosed: { backgroundColor: '#fee2e2', borderColor: '#fca5a5' },
  statusTextContainer: { flex: 1 },
  statusLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  statusValue: { fontSize: 32, fontWeight: '900' },
  toggleButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, gap: 8 },
  btnOpen: { backgroundColor: '#bbf7d0' },
  btnClose: { backgroundColor: '#fecaca' },
  toggleText: { fontWeight: '800' },
  textOpen: { color: '#15803d' },
  textClosed: { color: '#b91c1c' },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#334155', marginBottom: 15 },
  grid: { flexDirection: 'row', gap: 15, marginBottom: 30 },
  actionCard: { flex: 1, backgroundColor: '#fff', padding: 15, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  iconCircle: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  actionTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  actionSubtitle: { fontSize: 12, color: '#64748b', marginTop: 4 },

  statsContainer: { flexDirection: 'row', backgroundColor: '#fff', padding: 20, borderRadius: 16, justifyContent: 'space-between', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2, marginBottom: 40 },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 4 },
  divider: { width: 1, backgroundColor: '#e2e8f0' }
});