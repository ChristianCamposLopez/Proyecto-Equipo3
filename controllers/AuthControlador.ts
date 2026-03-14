// controllers/AuthControlador.ts
// Controlador de autenticación Refactorizado - Capa de Mediación
import { AuthService } from '@/services/AuthService';
import { AutenticacionDTO } from '@/models/entities/AutenticacionDTO';

export class AuthControlador {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async registrar(datos: AutenticacionDTO): Promise<void> {
    return this.authService.registrar(datos);
  }

  async login(datos: AutenticacionDTO): Promise<string> {
    return this.authService.login(datos);
  }

  async solicitarRecuperacion(email: string): Promise<string> {
    return this.authService.solicitarRecuperacion(email);
  }

  async verificarPermisos(email: string, permiso: string): Promise<boolean> {
    return this.authService.verificarPermisos(email, permiso);
  }
}
