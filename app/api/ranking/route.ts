// app/api/ranking/route.ts
// API Route — US019.2: Top 5 productos | US019.3: Filtro por fechas

import { NextRequest, NextResponse } from 'next/server';
import { RankingService } from '@/services/RankingService';

const rankingService = new RankingService();

/**
 * GET /api/ranking?start=YYYY-MM-DD&end=YYYY-MM-DD&limit=5
 * US019.2: Retorna el top N productos por ventas.
 * US019.3: Soporta filtrado por rango de fechas.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');
    const limit = parseInt(searchParams.get('limit') || '5', 10);

    const ranking = await rankingService.getTopProducts(startDate, endDate, limit);

    return NextResponse.json(ranking);
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error interno';
    return NextResponse.json({ error: mensaje }, { status: 500 });
  }
}
