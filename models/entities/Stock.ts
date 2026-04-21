// models/entities/Stock.ts

export interface Product {
  id: number;
  category_id: number;
  name: string;
  base_price: number;
  is_available: boolean;
  image_url: string | null;
  stock_quantity: number;
  low_stock_threshold: number;
  last_stock_update: string;
}

export interface StockUpdate {
  product_id: number;
  new_quantity: number;
  reason?: string; // 'RESTOCK', 'SALE', 'ADJUSTMENT', 'DAMAGE'
}

export interface StockAlert {
  product_id: number;
  name: string;
  current_stock: number;
  threshold: number;
  status: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'NORMAL';
}
