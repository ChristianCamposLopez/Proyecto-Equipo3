// models/entities/Usuario.ts
// Clase Usuario según Diagrama de Clases - US010.1, US010.3, US010.4

import { randomBytes } from 'crypto';
import { Rol } from './Rol';

/**
 * Entidad principal del módulo de gestión de acceso.
 * Cubre:
 *  - US010.1: passwordHash y constructor
 *  - US010.3: resetToken y tokenExpiracion
 *  - US010.4: Relación con Rol y validarRol()
 */
export class Usuario {
  public id: string;
  public email: string;
  public passwordHash: string;
  public nombre: string;
  public resetToken: string | null;
  public tokenExpiracion: Date | null;
  public rol: Rol | null;

  constructor(id: string, email: string, passHash: string, nombre: string) {
    this.id = id;
    this.email = email;
    this.passwordHash = passHash;
    this.nombre = nombre;
    this.resetToken = null;
    this.tokenExpiracion = null;
    this.rol = null;
  }

  /**
   * US010.4 — Valida si el usuario tiene el permiso requerido
   * basado en su rol asignado.
   * @param permiso - Nombre del rol o permiso a verificar
   * @returns true si el rol del usuario coincide o contiene el permiso
   */
  validarRol(permiso: string): boolean {
    if (!this.rol) return false;

    // Verificar si el nombre del rol coincide directamente
    if (this.rol.nombre.toLowerCase() === permiso.toLowerCase()) {
      return true;
    }

    // Verificar en la lista de permisos del rol
    if (this.rol.permisos) {
      const listaPermisos = this.rol.permisos.split(',').map(p => p.trim().toLowerCase());
      return listaPermisos.includes(permiso.toLowerCase());
    }

    return false;
  }

  /**
   * US010.3 — Genera un token temporal criptográficamente seguro
   * para la recuperación de cuenta.
   * @returns Token hexadecimal de 32 bytes
   */
  generarTokenTemporal(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * US010.3 — Asigna el token de reseteo y su expiración al usuario.
   * @param token - Token temporal generado
   * @param expiracion - Fecha de expiración del token
   */
  setResetToken(token: string, expiracion: Date): void {
    this.resetToken = token;
    this.tokenExpiracion = expiracion;
  }
}
