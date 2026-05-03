// models/entities/RankingEntities.ts
export interface RankedProductoEntity {
  product_id: number;
  product_name: string;
  total_quantity_sold: number;
}

export interface RankingResponse {
  ranking: RankedProductoEntity[];
  restaurantName: string | null;
}