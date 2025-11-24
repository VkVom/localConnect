import React, { createContext, useState, useContext, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { AuthContextType, UserData } from '../types/user';

// 1. Create the Context
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  setUser: () => {},
});

// 2. Create the Provider
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Listen to Firebase Auth changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        // User is signed in
        try {
          // Try to get role from Database
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              role: data.role || 'customer', 
            });
          } else {
            // Document doesn't exist (First time user) -> Default to Customer
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              role: 'customer',
            });
          }
        } catch (error) {
          // ERROR HANDLER: If Database fails (Offline/Permission), LOG IN ANYWAY
          console.error("Error fetching user role:", error);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: 'customer', // Fallback role
          });
        }
      } else {
        // User is signed out
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Create a custom hook for easy access
export const useAuth = () => useContext(AuthContext);