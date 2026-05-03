// app/api/auth/login/route.ts
// API Route — US010.2: Inicio de Sesión (Login)

import { NextRequest, NextResponse } from 'next/server';
import { AuthControlador } from '@/controllers/AuthControlador';
import { AutenticacionDTO } from '@/models/entities/AutenticacionDTO';

const authCtrl = new AuthControlador();

/**
 * POST /api/auth/login
 * Recibe AutenticacionDTO → valida credenciales → retorna JWT.
 * Diagrama de Secuencia US010.2: loginPage → authCtrl.login(AutenticacionDTO)
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

    // Ahora authCtrl.login nos devuelve el objeto { token, userId, rol }
    const authData = await authCtrl.login(datos);

    return NextResponse.json(
      { 
        token: authData.token, 
        userId: authData.userId, 
        rol: authData.rol, 
        mensaje: 'Inicio de sesión exitoso' 
      },
      { status: 200 }
    );
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error interno del servidor';

    // Determinar código de estado según el tipo de error
    let status = 500;
    if (mensaje.includes('no encontrado')) status = 404;
    if (mensaje.includes('incorrecta')) status = 401;

    return NextResponse.json({ error: mensaje }, { status });
  }
}
