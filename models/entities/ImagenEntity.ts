export interface ImagenEntity {
  id: number;
  product_id: number;
  image_path: string;
  file_name: string;
  file_size: number;
  format: string;
  is_primary: boolean;
  created_at: Date;
  deleted_at: Date | null;
}