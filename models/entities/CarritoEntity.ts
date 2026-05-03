// models/entities/CarritoEntity.ts
export interface CartItem {
  id: number;
  product_id: number;
  product_name: string;
  category_name: string;
  image_url: string | null;
  quantity: number;
  available_stock: number;
  is_available: boolean;
  unit_price: number;
  subtotal: number;
}

export interface CartSummary {
  id: number;
  customer_id?: number;
  restaurant_id?: number | null;
  restaurant_name: string | null;
  item_count: number;
  total_quantity: number;
  subtotal: number;
  iva: number;
  total_amount: number;
  items: CartItem[];
}
