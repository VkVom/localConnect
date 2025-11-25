import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { auth, db } from "../../config/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";

import LocationSelectModal from "../../components/LocationSelectModal";
import { MaterialIcons } from "@expo/vector-icons";

export default function RegisterShopkeeper() {
  const { control, handleSubmit } = useForm();
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [locModal, setLocModal] = useState(false);

  // REGISTER LOGIC
  const onRegister = async (data: any) => {
    if (!location) {
      Alert.alert("Location Required", "Please select shop location.");
      return;
    }

    setLoading(true);

    try {
      // 1. Create Auth User
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user = userCredential.user;
      const uid = user.uid;

      // 2. Create User Profile
      await setDoc(doc(db, "users", uid), {
        uid,
        name: data.ownerName,
        email: data.email,
        role: "shopkeeper",
        createdAt: serverTimestamp(),
      });

      // 3. Create Shop Profile
      await setDoc(doc(db, "shops", uid), {
        ownerId: uid,
        name: data.shopName,
        address: data.address,
        phone: data.phone,
        isOpen: false,
        createdAt: serverTimestamp(),
        latitude: location.latitude,
        longitude: location.longitude,
      });

      // 4. Send Verification Email
      await sendEmailVerification(user);

      // 5. Log out
      await signOut(auth);

      Alert.alert(
        "Verify Email",
        "A verification link has been sent. Please verify before logging in.",
        [{ text: "OK", onPress: () => navigation.navigate("Login") }]
      );
    } catch (err: any) {
      let msg = err.message;
      if (err.code === "auth/email-already-in-use") {
        msg = "This email is already registered.";
      }
      Alert.alert("Registration Failed", msg);
    }

    setLoading(false);
  };

  return (
    <ScrollView style={styles.wrapper} contentContainerStyle={{ paddingBottom: 60 }}>
      <Text style={styles.header}>Partner Signup</Text>
      <Text style={styles.subHeader}>Register your shop & go digital.</Text>

      {/* SECTION 1 */}
      <Text style={styles.section}>1. Owner Details</Text>

      {/* Owner Name */}
      <Field label="Owner Name">
        <Controller
          control={control}
          name="ownerName"
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Your Name"
              value={value}
              onChangeText={onChange}
            />
          )}
        />
      </Field>

      {/* Email */}
      <Field label="Email (Login ID)">
        <Controller
          control={control}
          name="email"
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="shop@example.com"
              value={value}
              onChangeText={onChange}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          )}
        />
      </Field>

      {/* Password */}
      <Field label="Password">
        <Controller
          control={control}
          name="password"
          rules={{ required: true, minLength: 6 }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="******"
              secureTextEntry
              value={value}
              onChangeText={onChange}
            />
          )}
        />
      </Field>

      {/* SECTION 2 */}
      <Text style={styles.section}>2. Shop Details</Text>

      {/* Shop Name */}
      <Field label="Shop Name">
        <Controller
          control={control}
          name="shopName"
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="My Kirana Store"
              value={value}
              onChangeText={onChange}
            />
          )}
        />
      </Field>

      {/* Address */}
      <Field label="Shop Address">
        <Controller
          control={control}
          name="address"
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, { height: 90 }]}
              placeholder="Full address..."
              multiline
              value={value}
              onChangeText={onChange}
            />
          )}
        />
      </Field>

      {/* LOCATION PICKER */}
      <Field label="Shop Location">
        {location ? (
          <TouchableOpacity
            style={styles.locationSelected}
            onPress={() => setLocModal(true)}
          >
            <MaterialIcons name="location-on" size={20} color="#0f766e" />
            <Text style={styles.locationText}>
              {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
            </Text>
            <Text style={styles.changeText}>Change</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.pickBtn}
            onPress={() => setLocModal(true)}
          >
            <MaterialIcons name="map" size={20} color="#2563eb" />
            <Text style={styles.pickBtnText}>Select Location</Text>
          </TouchableOpacity>
        )}
      </Field>

      {/* Contact */}
      <Field label="Contact Number">
        <Controller
          control={control}
          name="phone"
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="9876543210"
              keyboardType="phone-pad"
              value={value}
              onChangeText={onChange}
            />
          )}
        />
      </Field>

      {/* Register Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit(onRegister)}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Register Shop</Text>
        )}
      </TouchableOpacity>

      {/* LOCATION SELECT MODAL */}
      <LocationSelectModal
        visible={locModal}
        onClose={() => setLocModal(false)}
        onSelect={(loc) => setLocation(loc)}
      />
    </ScrollView>
  );
}

/* FIELD WRAPPER */
function Field(props: any) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={styles.label}>{props.label}</Text>
      {props.children}
    </View>
  );
}

/* STYLES */

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 22,
    paddingTop: 50,
  },

  header: {
    fontSize: 32,
    fontWeight: "800",
    color: "#d97706",
  },
  subHeader: {
    fontSize: 15,
    color: "#b45309",
    marginBottom: 25,
  },

  section: {
    fontSize: 19,
    fontWeight: "700",
    color: "#334155",
    marginTop: 20,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 4,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    backgroundColor: "white",
  },

  pickBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    backgroundColor: "#dbeafe",
    justifyContent: "center",
    gap: 10,
  },

  pickBtnText: {
    fontSize: 15,
    color: "#2563eb",
    fontWeight: "700",
  },

  locationSelected: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#dcfce7",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#86efac",
    gap: 8,
  },

  locationText: {
    flex: 1,
    color: "#166534",
    fontWeight: "700",
  },

  changeText: {
    color: "#166534",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },

  button: {
    backgroundColor: "#d97706",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 40,
  },

  buttonText: {
    color: "white",
    fontWeight: "800",
    fontSize: 16,
  },
});
