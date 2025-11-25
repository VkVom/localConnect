import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth'; // Import signOut
import { auth, db } from '../../config/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native'; // Import navigation hook

export default function RegisterCustomer() {
  const { control, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();

  const onRegister = async (data: any) => {
    setLoading(true);
    try {
      // 1. Create Auth User (This auto-logs them in)
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;
      const uid = user.uid;

      // 2. Create Firestore Profile
      await setDoc(doc(db, 'users', uid), {
        uid: uid,
        name: data.name,
        email: data.email,
        role: 'customer',
        createdAt: serverTimestamp(),
      });

      // 3. Send Verification Email
      await sendEmailVerification(user);

      // 4. CRITICAL FIX: Log them out immediately!
      await signOut(auth);
      
      Alert.alert(
        "Verify Your Email", 
        "A verification link has been sent to your email. Please verify it before logging in.",
        [
          { text: "OK", onPress: () => navigation.navigate('Login') }
        ]
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Customer Signup</Text>
      <Text style={styles.subHeader}>Join your local community.</Text>

      {/* Name Field */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Full Name</Text>
        <Controller
          control={control}
          rules={{ required: true }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="John Doe"
            />
          )}
          name="name"
        />
        {errors.name && <Text style={styles.error}>Name is required.</Text>}
      </View>

      {/* Email Field */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email Address</Text>
        <Controller
          control={control}
          rules={{ required: true }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="john@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          )}
          name="email"
        />
        {errors.email && <Text style={styles.error}>Email is required.</Text>}
      </View>

      {/* Password Field */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Password</Text>
        <Controller
          control={control}
          rules={{ required: true, minLength: 6 }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="******"
              secureTextEntry
            />
          )}
          name="password"
        />
        {errors.password && <Text style={styles.error}>Password must be 6+ chars.</Text>}
      </View>

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleSubmit(onRegister)}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnText}>Create Account</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#fff', justifyContent: 'center' },
  header: { fontSize: 28, fontWeight: '800', color: '#1e293b', marginBottom: 5 },
  subHeader: { fontSize: 16, color: '#64748b', marginBottom: 30 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, padding: 15, fontSize: 16, backgroundColor: '#f8fafc' },
  error: { color: '#ef4444', fontSize: 12, marginTop: 5 },
  button: { backgroundColor: '#2563eb', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});