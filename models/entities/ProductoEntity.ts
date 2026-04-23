export interface ProductoEntity {
  id: number;
  category_id: number;
  name: string;
  base_price: number;
  is_available: boolean;
  is_active: boolean;
  stock: number;
  deleted_at: Date | null;
  descripcion: string | null;
}