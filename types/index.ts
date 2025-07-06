export interface Product {
  id: string;
  name: string;
  brand: string;
  imageURL?: string[];
  imageURLs?: string[];
  productDescription: string;
  colors: string[];
  price1: number;
  price2: number;
  isProductStarred?: boolean;
  quantity?: number;
  lastUpdated?: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedPrice: 'price1' | 'price2';
  selectedColor: string;
}

export interface Client {
  companyName?: string;
  identification?: string;
  name?: string;
  surname?: string;
  phone?: string;
  address?: string;
  city?: string;
  department?: string;
  comentario?: string;
}

export interface ClientInfo {
  name?: string;
  surname?: string;
  phone?: string;
  company?: string;
  city?: string;
  department?: string;
  address?: string;
  identification?: string;
}

export interface OrderData {
  client: Client;
  cartItems: CartItem[];
  selectedPriceType: 'price1' | 'price2';
  comentario: string;
} 