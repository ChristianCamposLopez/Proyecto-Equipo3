// models/entities/Rol.ts
// Clase Rol según Diagrama de Clases - US010.4

/**
 * Representa un rol del sistema con sus permisos asociados.
 * Relación: Usuario pertenece a 1 Rol (0..* usuarios por rol).
 */
export class Rol {
  public id: number;
  public nombre: string;
  public permisos: string;

  constructor(id: number, nombre: string, permisos: string) {
    this.id = id;
    this.nombre = nombre;
    this.permisos = permisos;
  }
}
