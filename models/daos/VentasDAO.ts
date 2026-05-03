// models/daos/VentasDAO.ts
/**
 * Capa de Persistencia para Registro de Ventas
 * US006: Reportes de ventas diarias
 */
/**
 * Capa de persistencia para Reportes de Ventas
 * 
 * Historias de Usuario integradas:
 * - US025: Reportes de ventas (diarios, por rango)
 */

import { db } from '@/config/db';
import { VentaDiaria, FiltroVentas } from '@/models/entities';

export class VentasDAO {
  
  /**
   * Obtiene reporte de ventas por rango de fechas
   * US025: Reporte de ventas
   */
  static async getSalesReport(filtro: FiltroVentas): Promise<VentaDiaria[]> {
    const { fechaInicio, fechaFin, restauranteId } = filtro;
    
    // Estados que se consideran "ventas concretadas"
    const estadosExitosos = ['DELIVERY_ASSIGNED', 'COMPLETED'];

    let query = `
      SELECT DATE(created_at) AS fecha, 
             COUNT(id) AS numero_pedidos, 
             SUM(total_amount) AS total_ventas,
             AVG(total_amount) AS average_ticket,
             MAX(total_amount) AS max_sale,
             MIN(total_amount) AS min_sale
      FROM pedido_historial
      WHERE status = ANY($1::VARCHAR[])
    `;
    const params: any[] = [estadosExitosos];
    let paramCount = 2;

    if (fechaInicio) {
      const endDate = fechaFin || fechaInicio;
      query += ` AND DATE(created_at) BETWEEN $${paramCount} AND $${paramCount + 1}`;
      params.push(fechaInicio, endDate);
      paramCount += 2;
    }
    
    if (restauranteId) {
      query += ` AND restaurant_id = $${paramCount}`;
      params.push(restauranteId);
      paramCount++;
    }
    
    query += ` GROUP BY fecha ORDER BY fecha`;
    const result = await db.query(query, params);
    
    return result.rows.map(row => ({
      fecha: row.fecha,
      total_ventas: Number(row.total_ventas),
      numero_pedidos: Number(row.numero_pedidos),
      average_ticket: Number(row.average_ticket),
      max_sale: Number(row.max_sale),
      min_sale: Number(row.min_sale),
    }));
  }

  /**
   * Obtiene reporte de un solo día
   * US025
   */
  static async getDailySalesReport(fecha: string, restauranteId?: number): Promise<VentaDiaria | null> {
    const reportes = await this.getSalesReport({ fechaInicio: fecha, restauranteId });
    return reportes.length > 0 ? reportes[0] : null;
  }

  /**
   * Obtiene el nombre del restaurante para encabezados de reportes
   */
  static async getRestaurantName(restaurantId: number): Promise<string> {
    if (!restaurantId) return 'Todos los restaurantes';
    const result = await db.query('SELECT name FROM restaurants WHERE id = $1', [restaurantId]);
    return result.rows[0]?.name || `ID: ${restaurantId}`;
  }
}