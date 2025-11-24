import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { db, auth } from '../../config/firebase';
import { collection, addDoc, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'; // <--- NEW IMPORT

export default function Inventory() {
  const navigation = useNavigation(); // <--- NEW HOOK
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(collection(db, 'products'), where("shopId", "==", auth.currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(list);
    });
    return () => unsubscribe();
  }, []);

  const addProduct = async () => {
    if (!name || !price) return;
    try {
      await addDoc(collection(db, 'products'), {
        shopId: auth.currentUser?.uid,
        name: name,
        price: parseFloat(price),
        category: 'General'
      });
      setName('');
      setPrice('');
    } catch (e) {
      Alert.alert("Error", "Could not add product");
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (e) {
      Alert.alert("Error", "Could not delete");
    }
  }

  return (
    <View style={styles.container}>
      {/* --- NEW HEADER SECTION --- */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={28} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.title}>Manage Inventory</Text>
      </View>
      {/* -------------------------- */}
      
      <View style={styles.inputRow}>
        <TextInput 
          style={[styles.input, {flex: 2}]} 
          placeholder="Product Name" 
          value={name}
          onChangeText={setName}
        />
        <TextInput 
          style={[styles.input, {flex: 1}]} 
          placeholder="Price" 
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
        />
        <TouchableOpacity style={styles.addButton} onPress={addProduct}>
          <MaterialIcons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        keyExtractor={i => i.id}
        renderItem={({item}) => (
          <View style={styles.itemCard}>
            <View>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>₹{item.price}</Text>
            </View>
            <TouchableOpacity onPress={() => deleteProduct(item.id)}>
              <MaterialIcons name="delete" size={24} color="#ef4444" />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 20, paddingTop: 50 }, // Added paddingTop for status bar
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 }, // New Header Style
  backButton: { marginRight: 15 }, // New Back Button Style
  title: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  inputRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  input: { backgroundColor: 'white', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  addButton: { backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center', padding: 15, borderRadius: 10 },
  itemCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 10, elevation: 1 },
  itemName: { fontSize: 16, fontWeight: '600' },
  itemPrice: { color: '#64748b' }
});