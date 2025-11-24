import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, FlatList } from 'react-native';
import { db, auth } from '../../config/firebase';
import { collection, addDoc, serverTimestamp, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { Product } from '../../types/product';

export default function SalesLog() {
  const [selectedItem, setSelectedItem] = useState('');
  const [qty, setQty] = useState('');
  const [price, setPrice] = useState('0');
  
  const [history, setHistory] = useState<any[]>([]);
  const [inventory, setInventory] = useState<Product[]>([]);

  // 1. Listen to Recent Sales
  useEffect(() => {
    if (!auth.currentUser) return;
    
    const q = query(
      collection(db, 'sales'), 
      where("uid", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHistory(items);
    });

    return () => unsubscribe();
  }, []);

  // 2. Listen to Inventory (The "Quick Pick" List)
  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(collection(db, 'products'), where("shopId", "==", auth.currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setInventory(list);
    });
    return () => unsubscribe();
  }, []);

  const selectProduct = (product: Product) => {
    setSelectedItem(product.name);
    setPrice(product.price.toString());
  };

  const logSale = async () => {
    if (!selectedItem || !qty) return;

    try {
      await addDoc(collection(db, 'sales'), {
        uid: auth.currentUser?.uid,
        item: selectedItem,
        quantity: parseInt(qty),
        price: parseFloat(price),
        total: parseInt(qty) * parseFloat(price),
        createdAt: serverTimestamp(),
      });
      
      setSelectedItem('');
      setQty('');
      setPrice('0');
      Alert.alert("Success", "Sale Logged");
    } catch (error) {
      Alert.alert("Error", "Could not save data");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log Sale</Text>
      
      {/* Input Area */}
      <View style={styles.card}>
        <Text style={styles.label}>Selected Item</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Select from inventory below..." 
          value={selectedItem}
          editable={false} // Force selection from list
        />
        
        <View style={styles.row}>
          <View style={{flex: 1}}>
            <Text style={styles.label}>Quantity</Text>
            <TextInput 
              style={styles.input} 
              placeholder="0" 
              keyboardType="numeric"
              value={qty}
              onChangeText={setQty}
            />
          </View>
          <View style={{flex: 1}}>
            <Text style={styles.label}>Price (₹)</Text>
            <TextInput 
              style={[styles.input, {backgroundColor: '#f0f0f0'}]} 
              value={price}
              editable={false}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={logSale}>
          <Text style={styles.btnText}>CONFIRM SALE</Text>
        </TouchableOpacity>
      </View>

      {/* Inventory List (Quick Pick) */}
      <Text style={styles.sectionTitle}>Quick Pick from Inventory</Text>
      <View style={styles.inventoryList}>
        <FlatList
          data={inventory}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={i => i.id}
          renderItem={({item}) => (
            <TouchableOpacity style={styles.productChip} onPress={() => selectProduct(item)}>
              <Text style={styles.chipText}>{item.name}</Text>
              <Text style={styles.chipPrice}>₹{item.price}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Recent Sales History */}
      <Text style={styles.sectionTitle}>Recent Logs</Text>
      <FlatList
        data={history}
        keyExtractor={i => i.id}
        renderItem={({item}) => (
          <View style={styles.logItem}>
            <View>
              <Text style={styles.logText}>{item.item}</Text>
              <Text style={styles.logTime}>Qty: {item.quantity}</Text>
            </View>
            <Text style={styles.logTotal}>₹{item.total}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 20 },
  title: { fontSize: 24, fontWeight: '800', color: '#0f172a', marginBottom: 15 },
  card: { backgroundColor: 'white', padding: 20, borderRadius: 16, elevation: 2, marginBottom: 20 },
  label: { fontSize: 12, fontWeight: '600', color: '#64748b', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 12, marginBottom: 15, color: '#0f172a', fontWeight: '600' },
  row: { flexDirection: 'row', gap: 10 },
  button: { backgroundColor: '#2563eb', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 5 },
  btnText: { color: '#fff', fontWeight: 'bold' },
  
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#334155', marginBottom: 10 },
  inventoryList: { height: 80, marginBottom: 20 },
  productChip: { backgroundColor: 'white', padding: 15, borderRadius: 12, marginRight: 10, minWidth: 100, borderLeftWidth: 4, borderLeftColor: '#3b82f6', elevation: 1 },
  chipText: { fontWeight: '700', color: '#0f172a' },
  chipPrice: { color: '#64748b', fontSize: 12, marginTop: 2 },

  logItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: 'white', borderRadius: 10, marginBottom: 8 },
  logText: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  logTime: { fontSize: 12, color: '#64748b' },
  logTotal: { fontSize: 16, fontWeight: '700', color: '#15803d' }
});