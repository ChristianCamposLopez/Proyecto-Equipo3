// app/api/auth/recovery/route.ts
// API Route — US010.3: Recuperación de Cuenta

import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/AuthService';

const authService = new AuthService();

/**
 * POST /api/auth/recovery
 * Recibe email → genera token de recuperación.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'El email es obligatorio' },
        { status: 400 }
      );
    }

    await authService.solicitarRecuperacion(email);

    return NextResponse.json(
      { mensaje: 'Se ha enviado un enlace de recuperación a tu correo electrónico' },
      { status: 200 }
    );
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error interno del servidor';

    const status = mensaje.includes('no registrado') ? 404 : 500;

    return NextResponse.json({ error: mensaje }, { status });
  }
}
