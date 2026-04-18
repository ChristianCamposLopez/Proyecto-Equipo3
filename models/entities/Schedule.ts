// models/entities/Schedule.ts
// Entidad para US020: Disponibilidad horaria de productos

/**
 * Representa un rango horario de disponibilidad de un platillo.
 * Relación: 1 producto puede tener N horarios (uno por día de la semana).
 */
export interface Schedule {
  id: number;
  product_id: number;
  product_name?: string;
  day_of_week: number;   // 0=Domingo, 1=Lunes ... 6=Sábado
  start_time: string;    // formato HH:MM
  end_time: string;      // formato HH:MM
  created_at?: string;
}
