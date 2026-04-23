// models/daos/__tests__/RecomendacionDAO.test.ts
import { RecomendacionDAO } from "../RecomendacionDAO";
import { db } from "../../../config/db";

jest.mock("../../../config/db", () => ({
  db: { query: jest.fn() }
}));

describe("RecomendacionDAO - Análisis de Frecuencia (US021.2)", () => {
  test("Debe filtrar solo productos de pedidos con estado 'COMPLETED'", async () => {
    console.log("\n--- [DAO] Validando Filtro de Recomendaciones ---");
    const mockRows = [{ id: 101, name: "Tacos", score: "5" }];
    (db.query as jest.Mock).mockResolvedValue({ rows: mockRows });

    console.log("-> Consultando recomendaciones para Usuario: 1, Restaurante: 5");
    const result = await RecomendacionDAO.getTopRecommendations(1, 5);

    const sqlCall = (db.query as jest.Mock).mock.calls[0][0];
    console.log("-> Verificando cláusula SQL: Buscando 'o.status = COMPLETED'");
    
    expect(sqlCall).toContain("o.status = 'COMPLETED'");
    console.log(`-> Resultado obtenido: ${result.length} productos analizados.`);
    console.log("--- [ÉXITO] Regla de negocio SQL validada ---\n");
  });
});