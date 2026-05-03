// app/api/restaurant/route.ts
import { NextResponse } from 'next/server';
import { RestaurantService } from '@/services/RestaurantService';

const restaurantService = new RestaurantService();

/**
 * GET /api/restaurant
 * US025.7: Obtener perfil del restaurante
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get('ownerId');
    
    if (!ownerId) {
      return NextResponse.json({ error: 'Owner ID requerido' }, { status: 400 });
    }

    const perfil = await restaurantService.obtenerPerfil(parseInt(ownerId));
    if (!perfil) {
      return NextResponse.json({ message: 'No hay restaurante registrado' }, { status: 404 });
    }

    return NextResponse.json(perfil);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/restaurant
 * US025.1: Registrar restaurante
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ownerId, ...datos } = body;

    if (!ownerId) {
      return NextResponse.json({ error: 'Owner ID requerido' }, { status: 400 });
    }

    const nuevo = await restaurantService.registrar(ownerId, datos);
    return NextResponse.json(nuevo, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PUT /api/restaurant
 * US025.2 / US025.5 / US025.6: Actualizar restaurante
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...datos } = body;

    if (!id) {
      return NextResponse.json({ error: 'Restaurant ID requerido' }, { status: 400 });
    }

    const actualizado = await restaurantService.actualizarPerfil(id, datos);
    return NextResponse.json(actualizado);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
