// services/RankingService.ts
// Capa de servicio — US019: Inteligencia de Negocio y Ranking

import { RankingDAO } from '@/models/daos/RankingDAO';
import { RankedProduct } from '@/models/entities/RankedProduct';

/**
 * RankingService — Lógica de negocio para el ranking de ventas.
 * US019.1: Cálculo del ranking automático
 * US019.2: Top 5 productos
 * US019.3: Filtrado por fechas
 * US019.4: Exportación de datos
 */
export class RankingService {
  private rankingDAO: RankingDAO;

  constructor() {
    this.rankingDAO = new RankingDAO();
  }

  /**
   * US019.2: Obtiene el Top N productos (default 5).
   * US019.3: Con filtrado opcional por fechas.
   */
  async getTopProducts(
    startDate: string | null,
    endDate: string | null,
    limit: number = 5
  ): Promise<RankedProduct[]> {
    // Validaciones de negocio
    if (limit < 1 || limit > 100) {
      throw new Error('El límite debe estar entre 1 y 100');
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      throw new Error('La fecha de inicio no puede ser posterior a la fecha fin');
    }

    return this.rankingDAO.getTopProducts(startDate, endDate, limit);
  }

  /**
   * US019.4: Genera los datos para exportación en formato CSV.
   */
  async exportToCSV(
    startDate: string | null,
    endDate: string | null
  ): Promise<string> {
    const products = await this.rankingDAO.getSalesByProduct(startDate, endDate);

    const headers = ['Posición', 'Producto', 'Categoría', 'Unidades Vendidas', 'Ingresos Totales'];
    const rows = products.map((p, i) => [
      i + 1,
      `"${p.product_name}"`,
      `"${p.category_name}"`,
      p.total_sold,
      `$${Number(p.total_revenue).toFixed(2)}`
    ]);

    const csv = [
      `Ranking de Ventas — ${startDate || 'Inicio'} a ${endDate || 'Hoy'}`,
      '',
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    return csv;
  }

  /**
   * US019.4: Genera los datos para exportación en formato PDF (HTML tabular).
   * Se retorna HTML que el cliente puede imprimir como PDF.
   */
  async exportToPDFHtml(
    startDate: string | null,
    endDate: string | null
  ): Promise<string> {
    const products = await this.rankingDAO.getSalesByProduct(startDate, endDate);
    const periodo = `${startDate || 'Inicio'} — ${endDate || 'Hoy'}`;

    const rows = products.map((p, i) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #333;color:#D35400;font-weight:bold">${i + 1}</td>
        <td style="padding:8px;border-bottom:1px solid #333">${p.product_name}</td>
        <td style="padding:8px;border-bottom:1px solid #333;color:#888">${p.category_name}</td>
        <td style="padding:8px;border-bottom:1px solid #333;text-align:right">${p.total_sold}</td>
        <td style="padding:8px;border-bottom:1px solid #333;text-align:right;color:#D35400">$${Number(p.total_revenue).toFixed(2)}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Ranking de Ventas — ${periodo}</title>
        <style>
          body { font-family: Arial, sans-serif; background: #0a0a0a; color: #ededed; padding: 40px; }
          h1 { color: #D35400; font-size: 24px; }
          h2 { color: #888; font-size: 14px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th { text-align: left; padding: 10px 8px; border-bottom: 2px solid #D35400; color: #D35400; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; }
          @media print { body { background: white; color: black; } th { color: #D35400; } }
        </style>
      </head>
      <body>
        <h1>🏆 Ranking de Ventas</h1>
        <h2>Período: ${periodo}</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Producto</th>
              <th>Categoría</th>
              <th style="text-align:right">Uds. Vendidas</th>
              <th style="text-align:right">Ingresos</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <script>window.print()</script>
      </body>
      </html>
    `;
  }
}
