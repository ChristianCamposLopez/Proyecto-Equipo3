// controllers/AuthControlador.ts
// Controlador de autenticación según Diagrama de Clases - US010

import bcrypt from 'bcryptjs';
import { AuthRepositorio } from '@/models/daos/AuthRepositorio';
import { Usuario } from '@/models/entities/Usuario';
import { AutenticacionDTO } from '@/models/entities/AutenticacionDTO';
import { generarToken } from '@/config/jwt';

/**
 * AuthControlador — Controlador principal de gestión de acceso.
 * Métodos según diagrama de clases:
 *  - registrar(datos: AutenticacionDTO): void
 *  - login(datos: AutenticacionDTO): string
 *  - solicitarRecuperacion(email: string): void
 */
export class AuthControlador {
  private authRepo: AuthRepositorio;

  constructor() {
    this.authRepo = new AuthRepositorio();
  }

  /**
   * US010.1 — Registro de Administrador
   * Diagrama de Secuencia:
   *  1. Validar disponibilidad de correo (buscarPorEmail)
   *  2. Cifrado de clave (password -> passwordHash) con bcrypt
   *  3. Crear instancia de Usuario (id, email, passwordHash, nombre)
   *  4. Persistir con guardar(u)
   *  5. Asignar rol 'restaurant_admin' por defecto
   * 
   * @param datos - DTO con email, password y nombre
   * @throws Error si el email ya está registrado
   */
  async registrar(datos: AutenticacionDTO): Promise<void> {
    // Paso 3-5 del diagrama: buscarPorEmail → verificar disponibilidad
    const existente = await this.authRepo.buscarPorEmail(datos.email);
    if (existente) {
      throw new Error('El correo electrónico ya está registrado');
    }

    // US010.1: Cifrado de clave (password -> passwordHash)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(datos.password, salt);

    // Paso 7-8 del diagrama: create(id, email, passwordHash, nombre)
    const usuario = new Usuario('0', datos.email, passwordHash, datos.nombre || '');

    // Paso 9-12 del diagrama: guardar(u) → INSERT INTO usuarios
    await this.authRepo.guardar(usuario);

    // Asignar rol restaurant_admin (id=2) por defecto
    const userId = await this.authRepo.obtenerIdPorEmail(datos.email);
    if (userId) {
      await this.authRepo.asignarRol(userId, 2);
    }
  }

  /**
   * US010.2 — Inicio de Sesión (Login)
   * Diagrama de Secuencia:
   *  1. buscarPorEmail(email) → obtener usuario o null
   *  2. Si no existe → errorUsuarioNoEncontrado
   *  3. verificarCredenciales(pass, u.passwordHash) con bcrypt
   *  4. Si inválida → errorPasswordInvalido
   *  5. validarRol("Administrador") → verificar rol
   *  6. Generar token JWT → retornar string
   * 
   * @param datos - DTO con email y password
   * @returns Token JWT como string
   * @throws Error si las credenciales son inválidas o usuario no existe
   */
  async login(datos: AutenticacionDTO): Promise<string> {
    // Paso 3-6 del diagrama: buscarPorEmail → instancia de Usuario / null
    const usuario = await this.authRepo.buscarPorEmail(datos.email);

    // Caso: Usuario No Registrado (paso 14-15)
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    // Paso 7 del diagrama: verificarCredenciales(pass, u.passwordHash)
    const credencialesValidas = await bcrypt.compare(datos.password, usuario.passwordHash);

    // Caso: Password inválido (paso 12-13)
    if (!credencialesValidas) {
      throw new Error('Contraseña incorrecta');
    }

    // Paso 8-9 del diagrama: validarRol("Administrador")
    const rolNombre = usuario.rol?.nombre || 'sin_rol';

    // Paso 10 del diagrama: generar token JWT (String)
    const token = generarToken({
      userId: usuario.id,
      email: usuario.email,
      rol: rolNombre,
    });

    return token;
  }

  /**
   * US010.3 — Recuperación de Cuenta
   * Diagrama de Secuencia:
   *  1. buscarPorEmail(email) → obtener usuario o null
   *  2. Si no existe → errorEmailNoEncontrado
   *  3. generarTokenTemporal() → token seguro
   *  4. setResetToken(token, expiracion) → asignar al modelo
   *  5. guardar(u) → UPDATE usuarios SET reset_token, expiracion
   *  6. (Placeholder) Enviar correo electrónico con el enlace
   *  7. Retornar confirmación de envío
   * 
   * @param email - Email del usuario que solicita recuperación
   * @returns Token de recuperación generado
   * @throws Error si el email no está registrado
   */
  async solicitarRecuperacion(email: string): Promise<string> {
    // Paso 3-6 del diagrama: buscarPorEmail → instancia de Usuario / null
    const usuario = await this.authRepo.buscarPorEmail(email);

    // Caso: Email No Registrado (paso 16-17)
    if (!usuario) {
      throw new Error('Email no registrado en el sistema');
    }

    // Paso 7 del diagrama: generarTokenTemporal()
    const token = usuario.generarTokenTemporal();

    // Paso 8-9 del diagrama: setResetToken(token, expiracion)
    const expiracion = new Date();
    expiracion.setHours(expiracion.getHours() + 1); // Token válido por 1 hora
    usuario.setResetToken(token, expiracion);

    // Paso 10-13 del diagrama: guardar(u) → UPDATE usuarios SET reset_token...
    await this.authRepo.guardar(usuario);

    // Placeholder: Enviar correo electrónico con el enlace de recuperación
    // En producción aquí se integraría un servicio de email (nodemailer, etc.)
    console.log(`[US010.3] Enlace de recuperación generado para: ${email}`);

    // Paso 14-15: confirmacionEnvio → mostrarMensajeExito
    return token;
  }

  /**
   * US010.4 — Verificar permisos de un usuario por su email
   * Diagrama de Secuencia:
   *  1. buscarPorEmail(email) → obtener usuario con rol
   *  2. validarRol(permiso) → true/false
   * 
   * @param email - Email del usuario
   * @param permiso - Permiso o rol a verificar
   * @returns true si el usuario tiene el permiso, false si no
   */
  async verificarPermisos(email: string, permiso: string): Promise<boolean> {
    const usuario = await this.authRepo.buscarPorEmail(email);

    if (!usuario) {
      return false;
    }

    // Paso 7-8 / 11-12 del diagrama: validarRol → true/false
    return usuario.validarRol(permiso);
  }
}
