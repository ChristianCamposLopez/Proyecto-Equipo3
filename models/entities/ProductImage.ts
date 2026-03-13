// models/entities/ProductImage.ts

export interface ProductImage {
  product_id: number;
  image_url: string | null;
  image_uploaded_at: Date | null;
}