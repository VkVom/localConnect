import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { db, auth } from '../config/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

interface ReviewModalProps {
  visible: boolean;
  onClose: () => void;
  shopId: string;
}

export default function ReviewModal({ visible, onClose, shopId }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const submitReview = async () => {
    if (rating === 0) {
      Alert.alert("Error", "Please select a rating");
      return;
    }

    try {
      await addDoc(collection(db, `shops/${shopId}/reviews`), {
        userId: auth.currentUser?.uid,
        userName: auth.currentUser?.email?.split('@')[0] || 'Anonymous',
        rating,
        comment,
        createdAt: serverTimestamp()
      });
      Alert.alert("Success", "Review submitted!");
      setRating(0);
      setComment('');
      onClose();
    } catch (e) {
      Alert.alert("Error", "Could not submit review");
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Rate this Shop</Text>
          
          {/* Star Rating */}
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <MaterialIcons 
                  name={star <= rating ? "star" : "star-border"} 
                  size={40} 
                  color="#fbbf24" 
                />
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Write a comment..."
            multiline
            value={comment}
            onChangeText={setComment}
          />

          <View style={styles.buttons}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.btnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={submitReview} style={styles.submitBtn}>
              <Text style={[styles.btnText, {color: 'white'}]}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  container: { backgroundColor: 'white', borderRadius: 16, padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  stars: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20, gap: 10 },
  input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 10, height: 100, textAlignVertical: 'top', marginBottom: 20 },
  buttons: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, padding: 15, borderRadius: 8, backgroundColor: '#f1f5f9', alignItems: 'center' },
  submitBtn: { flex: 1, padding: 15, borderRadius: 8, backgroundColor: '#2563eb', alignItems: 'center' },
  btnText: { fontWeight: 'bold' }
});
