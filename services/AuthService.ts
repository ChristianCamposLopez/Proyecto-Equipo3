// services/AuthService.ts
import bcrypt from 'bcryptjs';
import { AuthRepositorio } from '@/models/daos/AuthRepositorio';
import { Usuario } from '@/models/entities/Usuario';
import { AutenticacionDTO } from '@/models/entities/AutenticacionDTO';
import { generarToken } from '@/config/jwt';

export class AuthService {
  private authRepo: AuthRepositorio;

  constructor() {
    this.authRepo = new AuthRepositorio();
  }

  async registrar(datos: AutenticacionDTO): Promise<void> {
    const existente = await this.authRepo.buscarPorEmail(datos.email);
    if (existente) {
      throw new Error('El correo electrónico ya está registrado');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(datos.password, salt);

    const usuario = new Usuario('0', datos.email, passwordHash, datos.nombre || '');
    await this.authRepo.guardar(usuario);

    const userId = await this.authRepo.obtenerIdPorEmail(datos.email);
    if (userId) {
      await this.authRepo.asignarRol(userId, 2); // restaurant_admin por defecto
    }
  }

  async login(datos: AutenticacionDTO): Promise<string> {
    const usuario = await this.authRepo.buscarPorEmail(datos.email);

    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    const credencialesValidas = await bcrypt.compare(datos.password, usuario.passwordHash);
    if (!credencialesValidas) {
      throw new Error('Contraseña incorrecta');
    }

    const rolNombre = usuario.rol?.nombre || 'sin_rol';

    return generarToken({
      userId: usuario.id,
      email: usuario.email,
      rol: rolNombre,
    });
  }

  async solicitarRecuperacion(email: string): Promise<string> {
    const usuario = await this.authRepo.buscarPorEmail(email);

    if (!usuario) {
      throw new Error('Email no registrado en el sistema');
    }

    const token = usuario.generarTokenTemporal();
    const expiracion = new Date();
    expiracion.setHours(expiracion.getHours() + 1);
    usuario.setResetToken(token, expiracion);

    await this.authRepo.guardar(usuario);
    return token;
  }

  async verificarPermisos(email: string, permiso: string): Promise<boolean> {
    const usuario = await this.authRepo.buscarPorEmail(email);
    if (!usuario) return false;
    return usuario.validarRol(permiso);
  }
}
