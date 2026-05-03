// models/entities/RestaurantDTO.ts

export interface HorarioDTO {
  dia: number; // 0-6
  apertura: string; // HH:mm
  cierre: string; // HH:mm
}

export interface RestaurantDTO {
  id?: number;
  nombre: string;
  tax_id: string; // RFC
  is_active?: boolean;
  latitude?: number;
  longitude?: number;
  logo_url?: string;
  horarios?: HorarioDTO[];
}
