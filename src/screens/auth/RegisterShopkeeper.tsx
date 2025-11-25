import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth'; // Import signOut
import { auth, db } from '../../config/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native'; // Import navigation
   import LocationPicker from '../../components/LocationPicker';
    import { MaterialIcons } from '@expo/vector-icons';

export default function RegisterShopkeeper() {
  const { control, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();
   const [showMap, setShowMap] = useState(false);
    const [location, setLocation] = useState<{latitude: number, longitude: number} | null>(null);

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
       latitude: location ? location.latitude : 12.9716, 
      longitude: location ? location.longitude : 77.5946,
      });
      if (!location) { Alert.alert("Error", "Please select shop location"); return; };

      // 4. Send Verification Email
      await sendEmailVerification(user);

      // 5. CRITICAL FIX: Log out so they don't auto-login
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
      <Text style={styles.header}>Partner Signup</Text>
      <Text style={styles.subHeader}>Create your digital shop.</Text>

      {/* Section 1: Personal Info */}
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

      {/* Section 2: Shop Details */}
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
            <TextInput style={[styles.input, {height: 80}]} onBlur={onBlur} onChangeText={onChange} value={value} placeholder="Full address..." multiline />
          )}
          name="address"
        />
      </View>
      <View style={styles.inputGroup}>
          <Text style={styles.label}>Shop Location</Text>
          
          {location ? (
             <View style={styles.locationPreview}>
               <MaterialIcons name="location-on" size={20} color="#16a34a" />
               <Text style={styles.locationText}>Location Selected</Text>
               <TouchableOpacity onPress={() => setShowMap(true)}>
                 <Text style={styles.changeLink}>Change</Text>
               </TouchableOpacity>
             </View>
          ) : (
            <TouchableOpacity style={styles.mapButton} onPress={() => setShowMap(true)}>
              <MaterialIcons name="map" size={20} color="#2563eb" />
              <Text style={styles.mapButtonText}>Pick on Map</Text>
            </TouchableOpacity>
          )}
        </View>
 <LocationPicker 
          visible={showMap} 
          onClose={() => setShowMap(false)}
          onConfirm={(loc) => setLocation(loc)}
        />

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
  );
}


const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 28, fontWeight: '800', color: '#d97706', marginBottom: 5, marginTop: 40 },
  subHeader: { fontSize: 16, color: '#b45309', marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#334155', marginTop: 10, marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 5 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, padding: 15, fontSize: 16, backgroundColor: '#fff' },
  button: { backgroundColor: '#d97706', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 20, marginBottom: 40 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
   mapButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#dbeafe', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#bfdbfe' },
    mapButtonText: { color: '#2563eb', fontWeight: 'bold', marginLeft: 8 },
    locationPreview: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#dcfce7', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#86efac' },
    locationText: { marginLeft: 8, color: '#15803d', fontWeight: 'bold', flex: 1 },
    changeLink: { color: '#166534', textDecorationLine: 'underline' }
});