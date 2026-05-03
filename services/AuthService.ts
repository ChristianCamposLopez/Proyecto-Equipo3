// services/AuthService.ts
import { AuthDAO } from '@/models/daos/AuthDAO';
import { UsuarioEntity } from '@/models/entities/UsuarioEntity';
import { AutenticacionDTO } from '@/models/entities/AutenticacionDTO';

export class AuthService {
  async registrar(datos: AutenticacionDTO): Promise<void> {
    const existente = await AuthDAO.buscarPorEmail(datos.email);
    if (existente) throw new Error('El correo electrónico ya está registrado');
    const usuario = new UsuarioEntity('0', datos.email, datos.password, datos.nombre || '');
    await AuthDAO.guardar(usuario);
    const userId = await AuthDAO.obtenerIdPorEmail(datos.email);
    if (userId) await AuthDAO.asignarRol(userId, 2);
  }

  async solicitarRecuperacion(email: string): Promise<string> {
    const usuario = await AuthDAO.buscarPorEmail(email);
    if (!usuario) throw new Error('Email no registrado');
    const token = usuario.generarTokenTemporal();
    const expiracion = new Date();
    expiracion.setHours(expiracion.getHours() + 1);
    usuario.setResetToken(token, expiracion);
    await AuthDAO.guardar(usuario);
    return token;
  }

  async login(datos: AutenticacionDTO): Promise<{ userId: string; rol: string }> {
    const usuario = await AuthDAO.buscarPorEmail(datos.email);
    if (!usuario) throw new Error('Usuario no encontrado');
    if (datos.password !== usuario.password) throw new Error('Contraseña incorrecta');
    return { userId: usuario.id, rol: usuario.rol?.nombre || 'sin_rol' };
  }
}
