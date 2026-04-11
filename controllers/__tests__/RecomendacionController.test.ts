// controllers/__tests__/RecomendacionController.test.ts
import { RecomendacionController } from "../RecomendacionController";
import { RecomendacionDAO } from "../../models/daos/RecomendacionDAO";

jest.mock("../../models/daos/RecomendacionDAO");

describe("RecomendacionController - Visualización", () => {
  test("Debe retornar un array vacío si el DAO no encuentra recomendaciones", async () => {
    console.log("\n--- [SERVICIO] Validando Regla: 'Mostrar Recomendados' ---");
    const controller = new RecomendacionController();
    (RecomendacionDAO.getTopRecommendations as jest.Mock).mockResolvedValue([]);

    console.log("-> Usuario sin historial detectado. Solicitando recomendaciones...");
    const result = await controller.getRecommendationsForUser(1, 10);

    console.log(`-> Cantidad de recomendaciones recibidas: ${result.length}`);
    expect(result).toEqual([]);
    console.log("-> Confirmado: No se mostrará la sección en la interfaz.");
    console.log("--- [ÉXITO] Comportamiento dinámico validado ---\n");
  });
});