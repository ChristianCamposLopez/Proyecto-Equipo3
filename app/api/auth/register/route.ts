// app/api/auth/register/route.ts
// API Route — US010.1: Registro de Administrador

import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/AuthService';
import { AutenticacionDTO } from '@/models/entities/AutenticacionDTO';

const authService = new AuthService();

/**
 * POST /api/auth/register
 * Recibe AutenticacionDTO → registra nuevo usuario.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar campos requeridos
    const datos: AutenticacionDTO = {
      email: body.email,
      password: body.password,
      nombre: body.nombre,
    };

    if (!datos.email || !datos.password || !datos.nombre) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios (email, password, nombre)' },
        { status: 400 }
      );
    }

    await authService.registrar(datos);

    return NextResponse.json(
      { mensaje: 'Usuario registrado exitosamente' },
      { status: 201 }
    );
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error interno del servidor';
    const status = mensaje.includes('ya está registrado') ? 409 : 500;

    return NextResponse.json({ error: mensaje }, { status });
  }
}
