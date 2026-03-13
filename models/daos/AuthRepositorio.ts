// models/daos/AuthRepositorio.ts
// Capa de persistencia según Diagrama de Clases - US010

import { db } from '@/config/db';
import { Usuario } from '@/models/entities/Usuario';
import { Rol } from '@/models/entities/Rol';

/**
 * AuthRepositorio — Repositorio de autenticación.
 * Métodos según diagrama de clases:
 *  - guardar(u: Usuario): void
 *  - buscarPorEmail(email: string): Usuario
 * 
 * Queries según diagramas de secuencia:
 *  - US010.1: INSERT INTO usuarios (id, email, pass_hash, nombre...)
 *  - US010.2: SELECT * FROM usuarios WHERE email =?
 *  - US010.3: UPDATE usuarios SET reset_token, expiracion...
 *  - US010.4: SELECT u.*, r.nombre FROM usuarios u JOIN roles r...
 */
export class AuthRepositorio {

  /**
   * Persiste un usuario en la base de datos.
   * Si el usuario ya existe (tiene id numérico), actualiza sus datos.
   * Si es nuevo, lo inserta.
   * 
   * US010.1: INSERT INTO usuarios (id, email, pass_hash, nombre...)
   * US010.3: UPDATE usuarios SET reset_token, expiracion...
   */
  async guardar(u: Usuario): Promise<void> {
    const existente = await db.query('SELECT id FROM users WHERE id = $1', [u.id]);

    if (existente.rows.length > 0) {
      // UPDATE — Actualizar usuario existente (US010.3: reset token)
      await db.query(
        `UPDATE users 
         SET email = $1, password_hash = $2, full_name = $3, 
             reset_token = $4, token_expiracion = $5
         WHERE id = $6`,
        [u.email, u.passwordHash, u.nombre, u.resetToken, u.tokenExpiracion, u.id]
      );
    } else {
      // INSERT — Nuevo usuario (US010.1: registro)
      await db.query(
        `INSERT INTO users (email, password_hash, full_name) 
         VALUES ($1, $2, $3)`,
        [u.email, u.passwordHash, u.nombre]
      );
    }
  }

  /**
   * Busca un usuario por su email, incluyendo su rol asignado.
   * 
   * US010.2: SELECT * FROM usuarios WHERE email =?
   * US010.4: SELECT u.*, r.nombre FROM usuarios u JOIN roles r...
   * 
   * @param email - Email del usuario a buscar
   * @returns Instancia de Usuario con su Rol o null si no existe
   */
  async buscarPorEmail(email: string): Promise<Usuario | null> {
    const resultado = await db.query(
      `SELECT u.id, u.email, u.password_hash, u.full_name, 
              u.reset_token, u.token_expiracion,
              r.id AS rol_id, r.name AS rol_nombre, r.permisos AS rol_permisos
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       WHERE u.email = $1`,
      [email]
    );

    if (resultado.rows.length === 0) {
      return null;
    }

    const fila = resultado.rows[0];

    // Crear instancia de Usuario según constructor del diagrama
    const usuario = new Usuario(
      fila.id.toString(),
      fila.email,
      fila.password_hash,
      fila.full_name
    );

    // Asignar campos de recuperación (US010.3)
    usuario.resetToken = fila.reset_token || null;
    usuario.tokenExpiracion = fila.token_expiracion 
      ? new Date(fila.token_expiracion) 
      : null;

    // Asignar rol si existe (US010.4)
    if (fila.rol_id) {
      usuario.rol = new Rol(
        fila.rol_id,
        fila.rol_nombre,
        fila.rol_permisos || ''
      );
    }

    return usuario;
  }

  /**
   * Asigna un rol a un usuario en la tabla intermedia user_roles.
   * Utilizado durante el registro para asignar el rol por defecto.
   */
  async asignarRol(userId: number, rolId: number): Promise<void> {
    await db.query(
      'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [userId, rolId]
    );
  }

  /**
   * Obtiene el ID del último usuario insertado por email.
   * Utilizado después del registro para asignar rol.
   */
  async obtenerIdPorEmail(email: string): Promise<number | null> {
    const resultado = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    return resultado.rows.length > 0 ? resultado.rows[0].id : null;
  }
}
