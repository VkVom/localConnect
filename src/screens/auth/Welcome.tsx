import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function Welcome() {
  const navigation = useNavigation<any>();

  return (
    <LinearGradient
      // Warm, inviting gradient (White -> Soft Orange -> Deeper Orange)
      colors={['#ffffff', '#fff7ed', '#ffedd5']} 
      style={styles.container}
    >
      <View style={styles.logoContainer}>
        <View style={styles.logoPlaceholder}>
          <MaterialIcons name="storefront" size={60} color="#f97316" />
        </View>
        <Text style={styles.appName}>LocalConnect</Text>
        <Text style={styles.tagline}>Your neighborhood, online.</Text>
      </View>

      <View style={styles.cardContainer}>
        <Text style={styles.question}>Who are you?</Text>

        {/* Customer Card */}
        <TouchableOpacity 
          style={styles.roleCard} 
          activeOpacity={0.9}
          onPress={() => navigation.navigate('RegisterCustomer')}
        >
          <View style={[styles.iconBg, { backgroundColor: '#dbeafe' }]}>
            <MaterialIcons name="shopping-bag" size={32} color="#2563eb" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.roleTitle}>Customer</Text>
            <Text style={styles.roleDesc}>I want to discover shops and buy products.</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#cbd5e1" />
        </TouchableOpacity>

        {/* Shopkeeper Card */}
        <TouchableOpacity 
          style={styles.roleCard} 
          activeOpacity={0.9}
          onPress={() => navigation.navigate('RegisterShopkeeper')}
        >
          <View style={[styles.iconBg, { backgroundColor: '#fef3c7' }]}>
            <MaterialIcons name="store" size={32} color="#d97706" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.roleTitle}>Shopkeeper</Text>
            <Text style={styles.roleDesc}>I want to sell products and manage my shop.</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#cbd5e1" />
        </TouchableOpacity>
      </View>

      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>Already have an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLink}>Log In</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  logoContainer: { alignItems: 'center', marginBottom: 50 },
  logoPlaceholder: { width: 100, height: 100, backgroundColor: 'white', borderRadius: 25, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#f97316', shadowOpacity: 0.3, shadowRadius: 10, marginBottom: 20 },
  appName: { fontSize: 32, fontWeight: '900', color: '#0f172a', letterSpacing: -1 },
  tagline: { fontSize: 16, color: '#64748b', marginTop: 5 },
  
  cardContainer: { gap: 20 },
  question: { fontSize: 18, fontWeight: '700', color: '#334155', marginBottom: 10 },
  roleCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 20, borderRadius: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  iconBg: { width: 60, height: 60, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  textContainer: { flex: 1 },
  roleTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  roleDesc: { fontSize: 13, color: '#64748b', marginTop: 4, lineHeight: 18 },

  loginContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 40, gap: 5 },
  loginText: { color: '#64748b', fontSize: 15 },
  loginLink: { color: '#f97316', fontWeight: 'bold', fontSize: 15 }
});