// app/api/auth/recovery/route.ts
// API Route — US010.3: Recuperación de Cuenta

import { NextRequest, NextResponse } from 'next/server';
import { AuthControlador } from '@/controllers/AuthControlador';

const authCtrl = new AuthControlador();

/**
 * POST /api/auth/recovery
 * Recibe email → genera token de recuperación.
 * Diagrama de Secuencia US010.3: recoveryPage → authCtrl.solicitarRecuperacion(email)
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

    // Paso 2 del diagrama: solicitarRecuperacion(email)
    await authCtrl.solicitarRecuperacion(email);

    // Paso 14-15 del diagrama: confirmacionEnvio → mostrarMensajeExito
    return NextResponse.json(
      { mensaje: 'Se ha enviado un enlace de recuperación a tu correo electrónico' },
      { status: 200 }
    );
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error interno del servidor';

    // Caso: Email No Registrado (paso 16-17)
    const status = mensaje.includes('no registrado') ? 404 : 500;

    return NextResponse.json({ error: mensaje }, { status });
  }
}
