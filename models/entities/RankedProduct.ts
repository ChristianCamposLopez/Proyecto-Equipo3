// models/entities/RankedProduct.ts
// Entidad para US019: Ranking de productos por ventas

/**
 * Representa un producto con sus métricas de ventas para el ranking.
 * Utilizado por RankingDAO y RankingService.
 */
export interface RankedProduct {
  product_id: number;
  product_name: string;
  category_name: string;
  total_sold: number;
  total_revenue: number;
}
