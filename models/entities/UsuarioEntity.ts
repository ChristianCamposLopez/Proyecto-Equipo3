// models/entities/UsuarioEntity.ts
// Clase Usuario según Diagrama de Clases - US010.1, US010.3, US010.4

import { RolEntity } from './RolEntity';

/**
 * Entidad principal del módulo de gestión de acceso.
 * Cubre:
 *  - US010.1: password y constructor
 *  - US010.3: resetToken y tokenExpiracion
 *  - US010.4: Relación con Rol y validarRol()
 */
export class UsuarioEntity {
  public id: string;
  public email: string;
  public password: string; // Almacenada en texto plano (Simplicidad Escolar)
  public nombre: string;
  public resetToken: string | null;
  public tokenExpiracion: Date | null;
  public rol: RolEntity | null;

  constructor(id: string, email: string, password: string, nombre: string) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.nombre = nombre;
    this.resetToken = null;
    this.tokenExpiracion = null;
    this.rol = null;
  }

  /**
   * US010.4 — Valida si el usuario tiene el permiso requerido
   */
  validarRol(permiso: string): boolean {
    if (!this.rol) return false;

    if (this.rol.nombre.toLowerCase() === permiso.toLowerCase()) {
      return true;
    }

    if (this.rol.permisos) {
      const listaPermisos = this.rol.permisos.split(',').map(p => p.trim().toLowerCase());
      return listaPermisos.includes(permiso.toLowerCase());
    }

    return false;
  }

  /**
   * US010.3 — Genera un token temporal simple para recuperación
   * @returns Token aleatorio simple
   */
  generarTokenTemporal(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  /**
   * US010.3 — Asigna el token de reseteo y su expiración
   */
  setResetToken(token: string, expiracion: Date): void {
    this.resetToken = token;
    this.tokenExpiracion = expiracion;
  }
}

