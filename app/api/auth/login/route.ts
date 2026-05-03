// app/api/auth/login/route.ts
// API Route — US010.2: Inicio de Sesión (Login)

import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/AuthService';
import { AutenticacionDTO } from '@/models/entities/AutenticacionDTO';

const authService = new AuthService();

/**
 * POST /api/auth/login
 * Recibe AutenticacionDTO → valida credenciales.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const datos: AutenticacionDTO = {
      email: body.email,
      password: body.password,
    };

    if (!datos.email || !datos.password) {
      return NextResponse.json({ error: 'Email y contraseña son obligatorios' }, { status: 400 });
    }

    const authData = await authService.login(datos);

    return NextResponse.json(
      { 
        userId: authData.userId, 
        rol: authData.rol, 
        mensaje: 'Inicio de sesión exitoso' 
      },
      { status: 200 }
    );
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error interno del servidor';

    let status = 500;
    if (mensaje.includes('no encontrado')) status = 404;
    if (mensaje.includes('incorrecta')) status = 401;

    return NextResponse.json({ error: mensaje }, { status });
  }
}
