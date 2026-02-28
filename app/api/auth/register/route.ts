// app/api/auth/register/route.ts
// API Route — US010.1: Registro de Administrador

import { NextRequest, NextResponse } from 'next/server';
import { AuthControlador } from '@/controllers/AuthControlador';
import { AutenticacionDTO } from '@/models/entities/AutenticacionDTO';

const authCtrl = new AuthControlador();

/**
 * POST /api/auth/register
 * Recibe AutenticacionDTO → registra nuevo usuario.
 * Diagrama de Secuencia US010.1: vista → authCtrl.registrar(AutenticacionDTO)
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

    // Paso 2 del diagrama: registrar(AutenticacionDTO)
    await authCtrl.registrar(datos);

    // Paso 13-14 del diagrama: mensajeExito → mostrarConfirmacion
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
