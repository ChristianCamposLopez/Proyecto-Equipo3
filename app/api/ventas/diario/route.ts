import { NextRequest, NextResponse } from 'next/server';
import { VentasController } from '@/controllers/ventasController';

const controller = new VentasController();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fecha = searchParams.get('fecha');
    const restauranteId = searchParams.get('restauranteId');

    if (!fecha) {
      return NextResponse.json(
        { error: 'Se requiere el parámetro "fecha"' },
        { status: 400 }
      );
    }

    const idRest = restauranteId ? Number(restauranteId) : undefined;
    if (restauranteId && isNaN(idRest!)) {
      return NextResponse.json(
        { error: 'restauranteId debe ser numérico' },
        { status: 400 }
      );
    }

    const reporte = await controller.getDailyReport(fecha, idRest);

    if (!reporte) {
      return NextResponse.json(
        { mensaje: 'No se encontraron ventas para esa fecha' },
        { status: 404 }
      );
    }

    // Incluimos meta con el nombre del restaurante (igual que ranking)
    const restaurantName = await controller.getRestaurantName(idRest ?? 0);
    return NextResponse.json({
      data: reporte,
      meta: { restaurantName },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error interno' },
      { status: 500 }
    );
  }
}