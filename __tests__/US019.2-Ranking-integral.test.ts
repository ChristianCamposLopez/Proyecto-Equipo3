import { RankingDAO } from '@/models/daos/RankingDAO';
import { RankingController } from '@/controllers/RankingController';
import { db } from '@/config/db';

jest.mock('@/config/db', () => ({
  db: { query: jest.fn() },
}));

const mockQuery = db.query as jest.Mock;

describe('US019.2 – Mostrar top 5 (límite y validaciones)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Persistencia (RankingDAO) – respeta el límite', () => {
    it('debe limitar los resultados al valor topN proporcionado', async () => {
      const dao = new RankingDAO();
      mockQuery.mockResolvedValueOnce({ rows: [] });
      await dao.getTopSellingProducts(1, new Date('2024-01-01'), new Date('2024-01-02'), 5);
      const [, , , limit] = mockQuery.mock.calls[0][1];
      expect(limit).toBe(5);
    });
  });

  describe('Lógica de negocio (RankingController) – top 5 por defecto y validaciones', () => {
    const controller = new RankingController();
    const validStart = new Date('2024-01-01');
    const validEnd = new Date('2024-01-02');

    it('debe devolver exactamente los 5 productos más vendidos (o menos si no hay suficientes)', async () => {
      const mockRanking = [
        { product_id: 1, product_name: 'Producto A', total_quantity_sold: 100 },
        { product_id: 2, product_name: 'Producto B', total_quantity_sold: 90 },
        { product_id: 3, product_name: 'Producto C', total_quantity_sold: 80 },
        { product_id: 4, product_name: 'Producto D', total_quantity_sold: 70 },
        { product_id: 5, product_name: 'Producto E', total_quantity_sold: 60 },
      ];
      const spyDao = jest.spyOn(RankingDAO.prototype, 'getTopSellingProducts')
        .mockResolvedValue(mockRanking);
      jest.spyOn(RankingDAO.prototype, 'getRestaurantName').mockResolvedValue('Resto');

      const result = await controller.getTopSellingProducts(1, validStart, validEnd, 5);
      expect(result.ranking).toHaveLength(5);
      expect(result.ranking).toEqual(mockRanking);
      spyDao.mockRestore();
    });

    it('debe rechazar límites negativos o cero', async () => {
      jest.spyOn(RankingDAO.prototype, 'getTopSellingProducts').mockResolvedValue([]);
      jest.spyOn(RankingDAO.prototype, 'getRestaurantName').mockResolvedValue('Resto');

      await expect(controller.getTopSellingProducts(1, validStart, validEnd, 0))
        .rejects.toThrow('El límite debe ser un número positivo');
      await expect(controller.getTopSellingProducts(1, validStart, validEnd, -5))
        .rejects.toThrow('El límite debe ser un número positivo');
    });

    it('debe aceptar límite 5 como válido', async () => {
      const spyDao = jest.spyOn(RankingDAO.prototype, 'getTopSellingProducts')
        .mockResolvedValue([]);
      jest.spyOn(RankingDAO.prototype, 'getRestaurantName').mockResolvedValue('Resto');

      await expect(controller.getTopSellingProducts(1, validStart, validEnd, 5))
        .resolves.not.toThrow();
      spyDao.mockRestore();
    });
  });
});