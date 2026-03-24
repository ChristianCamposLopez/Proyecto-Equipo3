// app/api/ranking/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { RankingService } from '../../../lib/ranking.service';

const rankingService = new RankingService();

export async function GET(request: NextRequest) {
  try {
    // Obtener parámetros de la URL
    const searchParams = request.nextUrl.searchParams;
    const restaurantIdParam = searchParams.get('restaurantId');
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const topNParam = searchParams.get('topN');

    // Validar parámetros obligatorios
    if (!restaurantIdParam || !startDateParam || !endDateParam) {
      return NextResponse.json(
        { error: 'Faltan parámetros: restaurantId, startDate, endDate' },
        { status: 400 }
      );
    }

    const restaurantId = parseInt(restaurantIdParam, 10);
    if (isNaN(restaurantId)) {
      return NextResponse.json(
        { error: 'restaurantId debe ser un número válido' },
        { status: 400 }
      );
    }

    const startDate = new Date(startDateParam);
    const endDate = new Date(endDateParam);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: 'Formato de fecha inválido. Use ISO 8601 (YYYY-MM-DDTHH:MM:SS)' },
        { status: 400 }
      );
    }

    let topN = 5; // valor por defecto
    if (topNParam) {
      topN = parseInt(topNParam, 10);
      if (isNaN(topN) || topN <= 0) {
        return NextResponse.json(
          { error: 'topN debe ser un número positivo' },
          { status: 400 }
        );
      }
    }

    // Llamar al servicio
    const { ranking, restaurantName } = await rankingService.getTopSellingProducts(
      restaurantId,
      startDate,
      endDate,
      topN
    );

    return NextResponse.json({
      data: ranking,
      meta: {
        restaurantId,
        restaurantName: restaurantName || 'Desconocido',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        topN,
        count: ranking.length
      }
    });

  } catch (error: any) {
    console.error('Ranking API error:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}