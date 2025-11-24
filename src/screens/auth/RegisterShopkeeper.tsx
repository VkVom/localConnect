import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';

export default function RegisterShopkeeper() {
  const { control, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);

  const onRegister = async (data: any) => {
    setLoading(true);
    try {
      // 1. Create Auth User
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;
      const uid = user.uid;

      // 2. Create User Profile
      await setDoc(doc(db, 'users', uid), {
        uid: uid,
        name: data.ownerName,
        email: data.email,
        role: 'shopkeeper',
        createdAt: serverTimestamp(),
      });

      // 3. Create Shop Profile
      await setDoc(doc(db, 'shops', uid), {
        ownerId: uid,
        name: data.shopName,
        address: data.address,
        phone: data.phone,
        isOpen: false,
        createdAt: serverTimestamp(),
        latitude: 12.9716, // Default, will fix later
        longitude: 77.5946
      });

      // 4. Send Verification Email
      await sendEmailVerification(user);
      
      Alert.alert(
        "Account Created", 
        "We have sent a verification link to your email. Please check your inbox before logging in."
      );

    } catch (error: any) {
      let errorMessage = error.message;
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered.';
      }
      Alert.alert("Registration Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#ffffff', '#fff7ed']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Partner Signup</Text>
        <Text style={styles.subHeader}>Create your digital shop.</Text>

        {/* Owner Details */}
        <Text style={styles.sectionTitle}>1. Owner Details</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Owner Name</Text>
          <Controller
            control={control}
            rules={{ required: true }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput style={styles.input} onBlur={onBlur} onChangeText={onChange} value={value} placeholder="Your Name" />
            )}
            name="ownerName"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email (Login ID)</Text>
          <Controller
            control={control}
            rules={{ required: true }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput style={styles.input} onBlur={onBlur} onChangeText={onChange} value={value} placeholder="shop@example.com" keyboardType="email-address" autoCapitalize="none" />
            )}
            name="email"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <Controller
            control={control}
            rules={{ required: true, minLength: 6 }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput style={styles.input} onBlur={onBlur} onChangeText={onChange} value={value} placeholder="******" secureTextEntry />
            )}
            name="password"
          />
        </View>

        {/* Shop Details */}
        <Text style={styles.sectionTitle}>2. Shop Details</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Shop Name</Text>
          <Controller
            control={control}
            rules={{ required: true }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput style={styles.input} onBlur={onBlur} onChangeText={onChange} value={value} placeholder="My Kirana Store" />
            )}
            name="shopName"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Shop Address</Text>
          <Controller
            control={control}
            rules={{ required: true }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput style={[styles.input, {height: 80}]} onBlur={onBlur} onChangeText={onChange} value={value} placeholder="Full Address..." multiline />
            )}
            name="address"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contact Number</Text>
          <Controller
            control={control}
            rules={{ required: true }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput style={styles.input} onBlur={onBlur} onChangeText={onChange} value={value} placeholder="9876543210" keyboardType="phone-pad" />
            )}
            name="phone"
          />
        </View>

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleSubmit(onRegister)}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnText}>Register Shop</Text>}
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 20 },
  header: { fontSize: 28, fontWeight: '800', color: '#d97706', marginBottom: 5, marginTop: 40 },
  subHeader: { fontSize: 16, color: '#b45309', marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#334155', marginTop: 10, marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#fed7aa', paddingBottom: 5 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, padding: 15, fontSize: 16, backgroundColor: '#fff' },
  button: { backgroundColor: '#d97706', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 20, marginBottom: 40 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});