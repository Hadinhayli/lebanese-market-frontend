
export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

export interface Category {
  id: string;
  name: string;
  subcategories: SubCategory[];
}

export interface SubCategory {
  id: string;
  name: string;
  categoryId: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
  subcategoryId: string;
  stock: number;
  rating: number;
  reviewCount: number;
}

export interface CartItem {
  productId: string;
  quantity: number;
  product: Product;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  createdAt: Date;
  address: string;
  phoneNumber: string;
  trackingNumber?: string;
  notes?: string;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  text: string;
  createdAt: Date;
  userName: string;
}
