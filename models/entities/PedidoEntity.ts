// models/entities/PedidoEntity.ts

export interface PedidoEntity {
  id: number;
  customer_id: number;
  restaurant_id: number;
  delivery_address_json: Record<string, any>;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED' | 'ON_DELIVERY' | 'DELIVERY_ASSIGNED';
  total_amount: number;
  created_at: string;
  confirmed_at?: string | null;
  estimated_delivery_at?: string | null;
  deliveryman_id?: number | null;
  deliveryman_name?: string | null;
  note?: string | null;
}

export interface PedidoItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price_at_purchase: number;
  product_name?: string;
}

export interface PedidoWithItems extends PedidoEntity {
  items?: PedidoItem[];
}
