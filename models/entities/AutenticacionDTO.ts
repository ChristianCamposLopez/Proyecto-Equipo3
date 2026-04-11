// models/entities/AutenticacionDTO.ts
// DTO según Diagrama de Clases - US010

/**
 * Data Transfer Object para operaciones de autenticación.
 * Transporta datos entre la Vista (Next.js) y el AuthControlador.
 */
export interface AutenticacionDTO {
  email: string;
  password: string;
  nombre?: string;
  tokenTemporal?: string;
}
