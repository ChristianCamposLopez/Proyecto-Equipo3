// models/entities/ProductImageEntity.ts
export interface ProductImageEntity {
  product_id: number;
  image_url: string;
  image_uploaded_at: Date | null;
}
