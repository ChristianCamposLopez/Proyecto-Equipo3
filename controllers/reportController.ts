// controllers/reportController.ts — US015 & US006: Exportación de reportes
import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { ReportDAO } from '@/models/daos/ReportDAO';

const dao = new ReportDAO();

/**
 * Función legada para obtener ventas diarias
 */
export const getDailySales = async () => {
  const data = await ReportDAO.getDailySales();
  return data;
};

/**
 * US015: Exportar reporte de ventas a Excel
 * GET /api/reports/sales-excel?restaurantId=1&startDate=2024-01-01&endDate=2024-12-31
 */
export async function exportSalesExcel(
  req: NextRequest
): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = parseInt(searchParams.get('restaurantId') || '1');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (isNaN(restaurantId) || restaurantId <= 0) {
      return NextResponse.json(
        { error: 'restaurantId inválido' },
        { status: 400 }
      );
    }

    // Obtener datos del reporte
    const reportData = await dao.getSalesReportFlat(restaurantId, startDate || undefined, endDate || undefined);

    // Crear workbook de Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Ventas');

    // Definir columnas
    worksheet.columns = [
      { header: 'Fecha', key: 'date', width: 12 },
      { header: 'Orden ID', key: 'order_id', width: 10 },
      { header: 'Mesa', key: 'table_number', width: 8 },
      { header: 'Estado', key: 'status', width: 12 },
      { header: 'Producto', key: 'product_name', width: 25 },
      { header: 'Cantidad', key: 'quantity', width: 10 },
      { header: 'Precio Unit.', key: 'unit_price', width: 12 },
      { header: 'Subtotal', key: 'subtotal', width: 12 }
    ];

    // Estilos de encabezado
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFB75D35' } // Color restaurante
    };

    // Agregar datos
    reportData.forEach(row => {
      worksheet.addRow({
        date: row.date,
        order_id: row.order_id,
        table_number: row.table_number,
        status: row.status,
        product_name: row.product_name,
        quantity: row.quantity,
        unit_price: parseFloat(row.unit_price as any).toFixed(2),
        subtotal: parseFloat(row.subtotal as any).toFixed(2)
      });
    });

    // Formato de moneda para columnas de precio
    worksheet.getColumn('unit_price').numFmt = '$#,##0.00';
    worksheet.getColumn('subtotal').numFmt = '$#,##0.00';

    // Generar buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Retornar como descarga
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="ventas_${startDate || 'completo'}.xlsx"`
      }
    });
  } catch (error) {
    console.error('[exportSalesExcel]', error);
    return NextResponse.json(
      { error: 'Error al generar reporte Excel' },
      { status: 500 }
    );
  }
}

/**
 * US006: Exportar resumen diario a CSV
 * GET /api/reports/daily-sales-csv?restaurantId=1&startDate=2024-01-01&endDate=2024-12-31
 */
export async function exportDailySalesCSV(
  req: NextRequest
): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = parseInt(searchParams.get('restaurantId') || '1');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (isNaN(restaurantId) || restaurantId <= 0) {
      return NextResponse.json(
        { error: 'restaurantId inválido' },
        { status: 400 }
      );
    }

    // Obtener datos
    const data = await dao.getDailySalesReport(restaurantId, startDate || undefined, endDate || undefined);

    // Generar CSV
    let csv = 'Fecha,Total Órdenes,Órdenes Completadas,Órdenes Canceladas,Ingresos Totales,Ticket Promedio\n';

    data.forEach(row => {
      csv += `${row.date},${row.total_orders},${row.completed_orders},${row.cancelled_orders},${row.total_revenue},${row.avg_order_value}\n`;
    });

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="reporte_diario_${startDate || 'completo'}.csv"`
      }
    });
  } catch (error) {
    console.error('[exportDailySalesCSV]', error);
    return NextResponse.json(
      { error: 'Error al generar reporte CSV' },
      { status: 500 }
    );
  }
}

/**
 * US006: Exportar resumen diario a Excel
 * GET /api/reports/daily-sales-excel?restaurantId=1&startDate=2024-01-01&endDate=2024-12-31
 */
export async function exportDailySalesExcel(
  req: NextRequest
): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = parseInt(searchParams.get('restaurantId') || '1');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (isNaN(restaurantId) || restaurantId <= 0) {
      return NextResponse.json(
        { error: 'restaurantId inválido' },
        { status: 400 }
      );
    }

    // Obtener datos
    const data = await dao.getDailySalesReport(restaurantId, startDate || undefined, endDate || undefined);

    // Crear workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte Diario');

    // Definir columnas
    worksheet.columns = [
      { header: 'Fecha', key: 'date', width: 12 },
      { header: 'Total Órdenes', key: 'total_orders', width: 15 },
      { header: 'Completadas', key: 'completed_orders', width: 15 },
      { header: 'Canceladas', key: 'cancelled_orders', width: 15 },
      { header: 'Ingresos Totales', key: 'total_revenue', width: 18 },
      { header: 'Ticket Promedio', key: 'avg_order_value', width: 18 }
    ];

    // Estilos
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFB75D35' }
    };

    // Agregar datos
    data.forEach(row => {
      worksheet.addRow({
        date: row.date,
        total_orders: row.total_orders,
        completed_orders: row.completed_orders,
        cancelled_orders: row.cancelled_orders,
        total_revenue: parseFloat(row.total_revenue as any).toFixed(2),
        avg_order_value: parseFloat(row.avg_order_value as any).toFixed(2)
      });
    });

    // Formato de moneda
    worksheet.getColumn('total_revenue').numFmt = '$#,##0.00';
    worksheet.getColumn('avg_order_value').numFmt = '$#,##0.00';

    // Generar buffer
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="reporte_diario_${startDate || 'completo'}.xlsx"`
      }
    });
  } catch (error) {
    console.error('[exportDailySalesExcel]', error);
    return NextResponse.json(
      { error: 'Error al generar reporte Excel' },
      { status: 500 }
    );
  }
}

/**
 * US006: Obtener resumen diario (JSON para dashboard)
 * GET /api/reports/daily-sales-data?restaurantId=1&startDate=2024-01-01&endDate=2024-12-31
 */
export async function getDailySalesReport(
  req: NextRequest
): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = parseInt(searchParams.get('restaurantId') || '1');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (isNaN(restaurantId) || restaurantId <= 0) {
      return NextResponse.json(
        { error: 'restaurantId inválido' },
        { status: 400 }
      );
    }

    const data = await dao.getDailySalesReport(restaurantId, startDate || undefined, endDate || undefined);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('[getDailySalesReport]', error);
    return NextResponse.json(
      { error: 'Error al obtener reporte de ventas' },
      { status: 500 }
    );
  }
}