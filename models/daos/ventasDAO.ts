// models/daos/ventasDAO.ts
import { db } from '@/config/db';
import { VentaDiaria, FiltroVentas } from '../entities/ventasEntity';

export class VentaDAO {
  async getSalesReport(filtro: FiltroVentas): Promise<VentaDiaria[]> {
    const { fechaInicio, fechaFin, restauranteId } = filtro;
    const endDate = fechaFin || fechaInicio;

    const estadosExitosos = ['DELIVERY_ASSIGNED', 'COMPLETED'];

    let query = `
      SELECT
        DATE(created_at) AS fecha,
        COUNT(id) AS numero_pedidos,
        SUM(total_amount) AS total_ventas
      FROM pedido_historial
      WHERE status = ANY($1::VARCHAR[])
        AND DATE(created_at) BETWEEN $2 AND $3
    `;
    const params: any[] = [estadosExitosos, fechaInicio, endDate];

    if (restauranteId) {
      query += ` AND restaurant_id = $4`;
      params.push(restauranteId);
    }

    query += ` GROUP BY fecha ORDER BY fecha`;

    const result = await db.query(query, params);
    return result.rows.map(row => ({
      fecha: row.fecha,
      total_ventas: Number(row.total_ventas),
      numero_pedidos: Number(row.numero_pedidos),
    }));
  }

  async getDailySalesReport(fecha: string, restauranteId?: number): Promise<VentaDiaria | null> {
    const reportes = await this.getSalesReport({
      fechaInicio: fecha,
      restauranteId,
    });
    return reportes.length > 0 ? reportes[0] : null;
  }

  async getRestaurantName(restaurantId: number): Promise<string> {
    if (!restaurantId) return 'Todos los restaurantes';

    const result = await db.query(
        'SELECT name FROM restaurants WHERE id = $1',
        [restaurantId]
    );

    return result.rows[0]?.name || `ID: ${restaurantId}`;
  }
}