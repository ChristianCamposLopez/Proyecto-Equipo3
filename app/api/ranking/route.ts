// app/api/ranking/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { RankingService } from '@/services/RankingService';

const controller = new RankingService();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const restaurantId = 1;
    const startDate = new Date(searchParams.get('startDate') || '');
    const endDate = new Date(searchParams.get('endDate') || '');
    const topN = Number(searchParams.get('topN') || '5');

    if (!restaurantId || isNaN(restaurantId)) {
      return NextResponse.json(
        { error: 'restaurantId inválido' },
        { status: 400 }
      );
    }

    console.log({
    startDate,
    endDate,
    restaurantId,
    topN
    });

    const data = await controller.getTopSellingProducts(
      restaurantId,
      startDate,
      endDate,
      topN
    );

    return NextResponse.json({
      data: data.ranking,
      meta: {
        restaurantName: data.restaurantName,
      },
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error interno' },
      { status: 500 }
    );
  }
}