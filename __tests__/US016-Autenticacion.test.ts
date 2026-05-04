/**
 * US016 & US027: Autenticación, Perfiles y Roles
 * Pruebas sobre el inicio de sesión, registro y control de acceso.
 */

import { AuthDAO } from "@/models/daos/AuthDAO";
import { AuthService } from "@/services/AuthService";
import { UsuarioEntity, RolEntity } from "@/models/entities";

// =========================================================
// MOCKS GLOBALES
// =========================================================
jest.mock("@/config/db", () => ({
  db: { query: jest.fn() },
}));
jest.mock("@/models/daos/AuthDAO");

describe("US027: Seguridad y Control de Acceso – Verificación Lógica", () => {
  let service: AuthService;

  beforeAll(() => {
    console.log(">>> [LOGICA] Verificando US016/US027: Seguridad, Autenticación y Roles...");
  });

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService();
  });

  describe("AuthService.login", () => {
    
    it("✓ DEBE permitir login con credenciales correctas y devolver el rol", async () => {
      console.log("  -> Caso: Login exitoso de Administrador");
      const fakeUser = new UsuarioEntity("1", "admin@test.com", "pass123", "Admin User");
      fakeUser.rol = new RolEntity(1, "ADMIN", "ALL");
      
      (AuthDAO.buscarPorEmail as jest.Mock).mockResolvedValue(fakeUser);

      const result = await service.login({ email: "admin@test.com", password: "pass123" });

      expect(result.userId).toBe("1");
      expect(result.rol).toBe("ADMIN");
    });

    it("⚠ DEBE rechazar si el usuario no existe", async () => {
      console.log("  -> Caso: Usuario no registrado");
      (AuthDAO.buscarPorEmail as jest.Mock).mockResolvedValue(null);

      await expect(service.login({ email: "ghost@test.com", password: "any" }))
        .rejects.toThrow("Usuario no encontrado");
    });

    it("⚠ DEBE rechazar si la contraseña es incorrecta", async () => {
      console.log("  -> Caso: Password mismatch");
      const fakeUser = new UsuarioEntity("1", "u@u.com", "correct", "User");
      (AuthDAO.buscarPorEmail as jest.Mock).mockResolvedValue(fakeUser);

      await expect(service.login({ email: "u@u.com", password: "wrong" }))
        .rejects.toThrow("Contraseña incorrecta");
    });
  });

  describe("AuthService.registrar (US010.1 / US027)", () => {
    it("✓ DEBE registrar un nuevo usuario y asignar rol por defecto (CUSTOMER)", async () => {
      console.log("  -> Caso: Registro de nuevo cliente");
      (AuthDAO.buscarPorEmail as jest.Mock).mockResolvedValue(null);
      (AuthDAO.obtenerIdPorEmail as jest.Mock).mockResolvedValue(100);

      await service.registrar({ email: "new@test.com", password: "123", nombre: "Nuevo" });

      expect(AuthDAO.guardar).toHaveBeenCalled();
      expect(AuthDAO.asignarRol).toHaveBeenCalledWith(100, 2); // 2 = Rol CUSTOMER por defecto
    });

    it("⚠ DEBE rechazar si el email ya existe", async () => {
      console.log("  -> Caso: Email duplicado");
      (AuthDAO.buscarPorEmail as jest.Mock).mockResolvedValue({ id: 1 });

      await expect(service.registrar({ email: "dup@test.com", password: "123" }))
        .rejects.toThrow("El correo electrónico ya está registrado");
    });
  });
});
