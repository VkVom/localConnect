export interface UserData {
  uid: string;
  email: string | null;
  role: 'customer' | 'shopkeeper' | null;
  createdAt?: any;
}

// This defines the shape of our Auth Context
export interface AuthContextType {
  user: UserData | null;
  isLoading: boolean;
  setUser: (user: UserData | null) => void;
}