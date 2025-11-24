// The User Profile
export interface UserProfile {
  uid: string;
  email: string;
  role: 'customer' | 'shopkeeper';
  createdAt: number;
}

// The Shop (Shopkeeper's entity)
export interface Shop {
  id: string; // Same as owner's UID
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
  isOpen: boolean;
  notice?: string;
  rating: number;
}

// The Product (Inventory)
export interface Product {
  id: string;
  shopId: string;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
}