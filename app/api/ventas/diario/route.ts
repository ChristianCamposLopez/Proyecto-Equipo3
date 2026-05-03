// app/api/ventas/diario/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { VentasService } from '@/services/VentasService';

const ventasService = new VentasService();

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

    const idRest = 1;

    const reporte = await ventasService.getDailyReport(fecha, idRest);

    if (!reporte) {
      return NextResponse.json(
        { mensaje: 'No se encontraron ventas para esa fecha' },
        { status: 404 }
      );
    }

    // Incluimos meta con el nombre del restaurante (igual que ranking)
    const restaurantName = await ventasService.getRestaurantName(idRest);
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