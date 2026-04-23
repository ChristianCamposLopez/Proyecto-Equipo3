// models/entities/Order.ts

export interface Order {
  id: number;
  customer_id: number;
  restaurant_id: number;
  delivery_address_json: Record<string, any>;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  total_amount: number;
  created_at: string;
  confirmed_at?: string | null;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price_at_purchase: number;
}

export interface OrderWithItems extends Order {
  items?: OrderItem[];
}
