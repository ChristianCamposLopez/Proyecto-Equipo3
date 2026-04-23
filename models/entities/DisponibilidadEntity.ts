// models/entities/DisponibilidadEntity.ts
export interface DisponibilidadEntity {
  id: number;
  product_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
}