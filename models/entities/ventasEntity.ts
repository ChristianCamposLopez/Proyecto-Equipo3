// models/entities/ventasEntity.ts
export interface VentaDiaria {
  fecha: string;          // YYYY-MM-DD
  total_ventas: number;
  numero_pedidos: number;
}

export interface FiltroVentas {
  fechaInicio: string;
  fechaFin?: string;
  restauranteId?: number;
}