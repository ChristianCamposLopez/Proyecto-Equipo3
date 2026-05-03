// models/entities/ventasEntity.ts
export interface VentaDiaria {
  fecha: string;          // YYYY-MM-DD
  total_ventas: number;
  numero_pedidos: number;
  average_ticket?: number;
  max_sale?: number;
  min_sale?: number;
}

export interface FiltroVentas {
  fechaInicio?: string;
  fechaFin?: string;
  restauranteId?: number;
}