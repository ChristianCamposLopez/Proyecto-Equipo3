// app/api/ventas/export/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { VentasService } from '@/services/VentasService';

const ventasService = new VentasService();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const inicio = searchParams.get('inicio');
    const fin = searchParams.get('fin') || undefined;
    const restauranteId = searchParams.get('restauranteId');
    const formato = searchParams.get('formato') as 'excel' | 'pdf' | null;

    if (!inicio) {
      return NextResponse.json(
        { error: 'Se requiere el parámetro "inicio"' },
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

    const { buffer, fileName } = await ventasService.exportSales(
      inicio,
      fin,
      idRest,
      formato || 'excel'
    );

    const contentType =
      formato === 'pdf'
        ? 'application/pdf'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    return new NextResponse(new Uint8Array(buffer), {
        headers: {
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${fileName}"`,
        },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error interno' },
      { status: 500 }
    );
  }
}