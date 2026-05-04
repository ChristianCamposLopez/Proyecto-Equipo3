/**
 * US025: Gestión de Restaurante
 * Pruebas sobre el registro, horarios y perfil del restaurante.
 */

import { RestaurantService } from "@/services/RestaurantService";
import { RestaurantDAO } from "@/models/daos/RestaurantDAO";

// =========================================================
// MOCKS GLOBALES
// =========================================================
jest.mock("@/models/daos/RestaurantDAO");

describe("US025: Gestión de Restaurante – Verificación Lógica", () => {
  let service: RestaurantService;

  beforeAll(() => {
    console.log(">>> [LOGICA] Verificando US025: Configuración de Restaurante...");
  });

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RestaurantService();
  });

  describe("RestaurantService.registrar (US025.1 / US025.4)", () => {
    
    it("✓ DEBE registrar restaurante con horarios válidos (Camino Feliz)", async () => {
      console.log("  -> Caso: Registro inicial completo");
      (RestaurantDAO.findByOwner as jest.Mock).mockResolvedValue(null);
      (RestaurantDAO.crearRestaurantEntity as jest.Mock).mockResolvedValue({ id: 1, name: "La Pizza" });
      (RestaurantDAO.setHours as jest.Mock).mockResolvedValue({});

      const datos = {
        nombre: "La Pizza",
        tax_id: "RFC123456",
        horarios: [{ dia: 1, apertura: "09:00", cierre: "22:00" }]
      };

      const result = await service.registrar(10, datos as any);

      expect(result.id).toBe(1);
      expect(RestaurantDAO.crearRestaurantEntity).toHaveBeenCalledWith(expect.objectContaining({ name: "La Pizza" }));
      expect(RestaurantDAO.setHours).toHaveBeenCalled();
    });

    it("⚠ DEBE rechazar si el usuario ya es dueño de un restaurante", async () => {
      console.log("  -> Caso: Un dueño = Un restaurante (Regla de Negocio)");
      (RestaurantDAO.findByOwner as jest.Mock).mockResolvedValue({ id: 1 });

      await expect(service.registrar(10, {} as any))
        .rejects.toThrow("Este usuario ya tiene un restaurante registrado");
    });

    it("⚠ DEBE rechazar horarios con cierre previo a la apertura (US025.4)", async () => {
      console.log("  -> Caso: Horario inválido (22:00 a 09:00)");
      (RestaurantDAO.findByOwner as jest.Mock).mockResolvedValue(null);
      (RestaurantDAO.crearRestaurantEntity as jest.Mock).mockResolvedValue({ id: 1 });

      const datos = {
        nombre: "Error",
        horarios: [{ dia: 1, apertura: "22:00", cierre: "09:00" }]
      };

      await expect(service.registrar(10, datos as any))
        .rejects.toThrow("El horario de cierre debe ser posterior a la apertura");
    });
  });

  describe("RestaurantService.toggleActivo (US025.6)", () => {
    it("✓ DEBE actualizar el estado de activación en el DAO", async () => {
      console.log("  -> Caso: Baja lógica del restaurante");
      const spy = (RestaurantDAO.actualizarRestaurantEntity as jest.Mock).mockResolvedValue({});

      await service.toggleActivo(1, false);

      expect(spy).toHaveBeenCalledWith(1, { is_active: false });
    });
  });

  describe("RestaurantService.obtenerPerfil (US025.7)", () => {
    it("✓ DEBE retornar el DTO estructurado con horarios", async () => {
      console.log("  -> Caso: Consulta de perfil detallado");
      (RestaurantDAO.findByOwner as jest.Mock).mockResolvedValue({ id: 1, name: "Test" });
      (RestaurantDAO.getHours as jest.Mock).mockResolvedValue([{ day_of_week: 1, open_time: "10:00", close_time: "20:00" }]);

      const perfil = await service.obtenerPerfil(10);

      expect(perfil).toHaveProperty("horarios");
      expect(perfil?.horarios).toHaveLength(1);
      expect(perfil?.nombre).toBe("Test");
    });
  });
});
