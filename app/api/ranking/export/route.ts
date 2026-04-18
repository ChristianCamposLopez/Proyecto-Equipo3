// app/api/ranking/export/route.ts
// API Route — US019.4: Exportación del ranking a PDF o CSV (Excel)

import { NextRequest, NextResponse } from 'next/server';
import { RankingService } from '@/services/RankingService';

const rankingService = new RankingService();

/**
 * GET /api/ranking/export?start=YYYY-MM-DD&end=YYYY-MM-DD&format=csv|pdf
 * US019.4: Exporta el ranking en el formato solicitado.
 * - csv: Descarga archivo .csv compatible con Excel
 * - pdf: Retorna HTML imprimible como PDF
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');
    const format = searchParams.get('format') || 'csv';

    if (format === 'csv') {
      const csv = await rankingService.exportToCSV(startDate, endDate);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="ranking_ventas_${Date.now()}.csv"`,
        },
      });
    }

    if (format === 'pdf') {
      const html = await rankingService.exportToPDFHtml(startDate, endDate);
      return new NextResponse(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    }

    return NextResponse.json(
      { error: 'Formato no soportado. Usa "csv" o "pdf".' },
      { status: 400 }
    );
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error interno';
    return NextResponse.json({ error: mensaje }, { status: 500 });
  }
}
