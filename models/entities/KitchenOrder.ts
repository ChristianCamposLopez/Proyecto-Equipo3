// models/entities/KitchenOrder.ts
// Entidad para US004: Panel de cocina en tiempo real

/**
 * Representa un pedido visto desde la perspectiva de cocina.
 * Incluye sus items para que el chef sepa qué preparar.
 */
export interface KitchenOrder {
  id: number;
  status: string;          // PENDING | PREPARING | READY | COMPLETED
  total_amount: number;
  created_at: string;
  customer_name: string;
  items: KitchenOrderItem[];
}

/**
 * Item individual dentro de un pedido de cocina.
 */
export interface KitchenOrderItem {
  product_name: string;
  quantity: number;
  unit_price: number;
}
