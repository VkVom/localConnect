import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { db } from "../../config/firebase";
import {
  addDoc,
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { MaterialIcons } from "@expo/vector-icons";
import AppInput from "../../components/AppInput";

export default function Inventory() {
  const { user } = useAuth();
  const uid = user?.uid;

  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  // Form fields
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [expiry, setExpiry] = useState("");

  // Fetch items
  useEffect(() => {
    if (!uid) return;

    const q = query(collection(db, "products"), where("shopId", "==", uid));
    return onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setProducts(list);
    });
  }, [uid]);

  const isExpired = (date: string) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  const addItem = async () => {
    if (!name || !price || !expiry) {
      Alert.alert("Error", "Name, Price & Expiry required");
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, "products"), {
        shopId: uid,
        name,
        category,
        price: Number(price),
        expiry,
        outOfStock: false,
        createdAt: serverTimestamp(),
      });

      setName("");
      setCategory("");
      setPrice("");
      setExpiry("");
    } catch {
      Alert.alert("Error", "Failed to add item");
    }

    setLoading(false);
  };

  const toggleOutOfStock = async (id: string, current: boolean) => {
    await updateDoc(doc(db, "products", id), { outOfStock: !current });
  };

  const deleteItem = async (id: string) => {
    await deleteDoc(doc(db, "products", id));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Inventory</Text>

      <View style={styles.inputCard}>
        <AppInput label="Item Name" placeholder="Milk / Biscuit" value={name} onChangeText={setName} />

        <AppInput label="Category" placeholder="Snacks / General" value={category} onChangeText={setCategory} />

        <AppInput label="Price (₹)" placeholder="Enter price" value={price} onChangeText={setPrice} keyboardType="numeric" />

        <AppInput label="Expiry Date" placeholder="YYYY-MM-DD" value={expiry} onChangeText={setExpiry} />

        <TouchableOpacity style={styles.addBtn} onPress={addItem} disabled={loading}>
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.addBtnText}>Add Item</Text>}
        </TouchableOpacity>
      </View>

      <FlatList
        style={{ marginTop: 20 }}
        data={products}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => {
          const expired = isExpired(item.expiry);

          return (
            <View style={[styles.itemCard, item.outOfStock && styles.cardOut, expired && styles.cardExpired]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemCategory}>{item.category}</Text>
                <Text style={styles.itemPrice}>₹{item.price}</Text>

                <Text style={[styles.expiry, expired ? styles.expired : styles.valid]}>
                  Expiry: {item.expiry}
                </Text>

                {item.outOfStock && <Text style={styles.outStock}>OUT OF STOCK</Text>}
              </View>

              <View style={styles.actions}>
                <TouchableOpacity onPress={() => toggleOutOfStock(item.id, item.outOfStock)} style={styles.actionBtn}>
                  <MaterialIcons
                    name={item.outOfStock ? "check-circle" : "highlight-off"}
                    size={26}
                    color={item.outOfStock ? "#16a34a" : "#b91c1c"}
                  />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => deleteItem(item.id)} style={styles.actionBtn}>
                  <MaterialIcons name="delete" size={26} color="#dc2626" />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f1f5f9" },
  title: { fontSize: 22, fontWeight: "700", color: "#0f172a", marginBottom: 20 },

  inputCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    elevation: 3,
  },

  addBtn: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
    alignItems: "center",
  },
  addBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },

  itemCard: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
  },

  cardOut: { opacity: 0.6 },
  cardExpired: { borderWidth: 1, borderColor: "#dc2626" },

  itemName: { fontSize: 18, fontWeight: "700" },
  itemCategory: { fontSize: 14, color: "#94a3b8" },
  itemPrice: { fontSize: 16, fontWeight: "700", marginTop: 4 },

  expiry: { marginTop: 6, fontSize: 13 },
  expired: { color: "#dc2626", fontWeight: "700" },
  valid: { color: "#059669" },

  outStock: { marginTop: 6, color: "#b91c1c", fontWeight: "700" },

  actions: { marginLeft: 10, alignItems: "center" },
  actionBtn: {
    padding: 6,
    marginBottom: 10,
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
  },
});
