// models/daos/AuthDAO.ts
/**
 * Capa de persistencia para Autenticación y Usuarios
 * 
 * Historias de Usuario integradas:
 * - US010: Autenticación y Gestión de Perfiles
 *   - US010.1: Registro de usuarios
 *   - US010.2: Login (Ahora sin JWT, plain text)
 *   - US010.3: Recuperación de contraseña
 *   - US010.4: Gestión de roles y permisos
 */

import { db } from '@/config/db';
import { UsuarioEntity, RolEntity } from '@/models/entities';

export class AuthDAO {
  
  /**
   * Persiste un usuario (Registro o Actualización)
   * US010.1 / US010.3
   */
  static async guardar(u: UsuarioEntity): Promise<void> {
    const existente = await db.query('SELECT id FROM users WHERE id = $1', [u.id]);
    if (existente.rows.length > 0) {
      // US010.3: Actualización de tokens de recuperación o perfiles
      await db.query(
        `UPDATE users 
         SET email = $1, password_hash = $2, full_name = $3, 
             reset_token = $4, token_expiracion = $5 
         WHERE id = $6`,
        [u.email, u.password, u.nombre, u.resetToken, u.tokenExpiracion, u.id]
      );
    } else {
      // US010.1: Registro de nuevo usuario
      await db.query(
        `INSERT INTO users (email, password_hash, full_name) 
         VALUES ($1, $2, $3)`,
        [u.email, u.password, u.nombre]
      );
    }
  }

  /**
   * Busca un usuario por email con su rol
   * US010.2 / US010.4
   */
  static async buscarPorEmail(email: string): Promise<UsuarioEntity | null> {
    const resultado = await db.query(
      `SELECT u.*, r.id AS rol_id, r.name AS rol_nombre, r.permisos AS rol_permisos
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       WHERE u.email = $1`,
      [email]
    );
    if (resultado.rows.length === 0) return null;
    
    const fila = resultado.rows[0];
    const usuario = new UsuarioEntity(
      fila.id.toString(), 
      fila.email, 
      fila.password_hash, 
      fila.full_name
    );

    // US010.3: Carga de tokens
    usuario.resetToken = fila.reset_token || null;
    usuario.tokenExpiracion = fila.token_expiracion ? new Date(fila.token_expiracion) : null;

    // US010.4: Carga de rol y permisos
    if (fila.rol_id) {
      usuario.rol = new RolEntity(fila.rol_id, fila.rol_nombre, fila.rol_permisos || '');
    }
    return usuario;
  }

  /**
   * Asigna un rol a un usuario
   * US010.4
   */
  static async asignarRol(userId: number, rolId: number): Promise<void> {
    await db.query(
      'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [userId, rolId]
    );
  }

  /**
   * Obtiene ID por email para flujos post-registro
   */
  static async obtenerIdPorEmail(email: string): Promise<number | null> {
    const resultado = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    return resultado.rows.length > 0 ? resultado.rows[0].id : null;
  }
  /**
   * Busca un usuario por ID
   * US025.7
   */
  static async buscarPorId(id: number): Promise<UsuarioEntity | null> {
    const resultado = await db.query(
      `SELECT u.*, r.id AS rol_id, r.name AS rol_nombre, r.permisos AS rol_permisos
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       WHERE u.id = $1`,
      [id]
    );
    if (resultado.rows.length === 0) return null;
    
    const fila = resultado.rows[0];
    const usuario = new UsuarioEntity(
      fila.id.toString(), 
      fila.email, 
      fila.password_hash, 
      fila.full_name
    );
    if (fila.rol_id) {
      usuario.rol = new RolEntity(fila.rol_id, fila.rol_nombre, fila.rol_permisos || '');
    }
    return usuario;
  }
}
