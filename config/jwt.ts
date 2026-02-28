// config/jwt.ts
// Utilidades para generación y verificación de tokens JWT - US010.2

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_restaurante_eq3';
const JWT_EXPIRATION = '24h';

/**
 * Payload del token JWT para sesiones de usuario.
 */
export interface JWTPayload {
  userId: string;
  email: string;
  rol: string;
}

/**
 * Genera un token JWT con los datos del usuario autenticado.
 * @param payload - Datos del usuario a incluir en el token
 * @returns Token JWT firmado
 */
export function generarToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
}

/**
 * Verifica y decodifica un token JWT.
 * @param token - Token JWT a verificar
 * @returns Payload decodificado o null si el token es inválido
 */
export function verificarToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}
