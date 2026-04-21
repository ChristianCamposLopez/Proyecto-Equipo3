export interface RankedProduct {
  product_id: number;
  product_name: string;
  total_quantity_sold: number;
}

export interface RankingResponse {
  ranking: RankedProduct[];
  restaurantName: string | null;
}