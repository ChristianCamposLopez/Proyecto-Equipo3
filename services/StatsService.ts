// services/StatsService.ts — US019: Estadísticas de platos más vendidos
import { NextRequest, NextResponse } from 'next/server';
import { StatsDAO } from '@/models/daos/StatsDAO';

/**
 * US019: Obtener los platillos más vendidos
 * GET /api/stats/top-products?restaurantId=1&days=30&limit=10
 */
export async function getTopProducts(
  req: NextRequest
): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = parseInt(searchParams.get('restaurantId') || '1');
    const days = parseInt(searchParams.get('days') || '30');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (isNaN(restaurantId) || restaurantId <= 0) {
      return NextResponse.json(
        { error: 'restaurantId inválido' },
        { status: 400 }
      );
    }

    // Llamada estática al DAO
    const products = await StatsDAO.getTopProducts(restaurantId, days, limit);

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error('[getTopProducts]', error);
    return NextResponse.json(
      { error: 'Error al obtener productos más vendidos' },
      { status: 500 }
    );
  }
}

/**
 * US019: Obtener estadísticas diarias de ventas
 * GET /api/stats/daily-sales?restaurantId=1&days=30
 */
export async function getDailySalesStats(
  req: NextRequest
): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = parseInt(searchParams.get('restaurantId') || '1');
    const days = parseInt(searchParams.get('days') || '30');

    if (isNaN(restaurantId) || restaurantId <= 0) {
      return NextResponse.json(
        { error: 'restaurantId inválido' },
        { status: 400 }
      );
    }

    // Llamada estática al DAO
    const stats = await StatsDAO.getDailySalesStats(restaurantId, days);

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error('[getDailySalesStats]', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas de ventas' },
      { status: 500 }
    );
  }
}

/**
 * US019: Obtener ingresos por categoría
 * GET /api/stats/revenue-by-category?restaurantId=1&days=30
 */
export async function getRevenueByCategory(
  req: NextRequest
): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = parseInt(searchParams.get('restaurantId') || '1');
    const days = parseInt(searchParams.get('days') || '30');

    if (isNaN(restaurantId) || restaurantId <= 0) {
      return NextResponse.json(
        { error: 'restaurantId inválido' },
        { status: 400 }
      );
    }

    // Llamada estática al DAO
    const revenue = await StatsDAO.getRevenueByCategory(restaurantId, days);

    return NextResponse.json(revenue, { status: 200 });
  } catch (error) {
    console.error('[getRevenueByCategory]', error);
    return NextResponse.json(
      { error: 'Error al obtener ingresos por categoría' },
      { status: 500 }
    );
  }
}

/**
 * US019: Obtener resumen general de ventas
 * GET /api/stats/overview?restaurantId=1&days=30
 */
export async function getSalesOverview(
  req: NextRequest
): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = parseInt(searchParams.get('restaurantId') || '1');
    const days = parseInt(searchParams.get('days') || '30');

    if (isNaN(restaurantId) || restaurantId <= 0) {
      return NextResponse.json(
        { error: 'restaurantId inválido' },
        { status: 400 }
      );
    }

    // Llamada estática al DAO
    const overview = await StatsDAO.getSalesOverview(restaurantId, days);

    return NextResponse.json(overview, { status: 200 });
  } catch (error) {
    console.error('[getSalesOverview]', error);
    return NextResponse.json(
      { error: 'Error al obtener resumen de ventas' },
      { status: 500 }
    );
  }
}

