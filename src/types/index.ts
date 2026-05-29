export type OrderStatus = 'pending' | 'confirmed' | 'en_route' | 'delivered' | 'cancelled';
export type Urgency = 'standard' | 'express' | 'vip';

export interface Address {
  name?: string;
  phone?: string;
  address?: string;
  lat?: number;
  lng?: number;
  instructions?: string;
  [key: string]: any; // fallback for other fields
}

export interface Order {
  id: string;
  user_id?: string;
  sender_address: Address;
  receiver_address: Address;
  price: number;
  distance: number;
  status: OrderStatus;
  urgency: Urgency;
  payment_method: string;
  created_at: string;
}
