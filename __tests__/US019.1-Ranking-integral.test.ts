import { RankingDAO } from '@/models/daos/RankingDAO';
import { RankingController } from '@/controllers/RankingController';
import { db } from '@/config/db';

jest.mock('@/config/db', () => ({
  db: { query: jest.fn() },
}));

const mockQuery = db.query as jest.Mock;

describe('US019.1 – Calcular ranking de ventas (persistencia y lógica)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Persistencia (RankingDAO)', () => {
    const dao = new RankingDAO();

    it('debe construir la consulta SQL correcta para el ranking', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const mockRows = [{ product_id: 1, product_name: 'Pizza', total_quantity_sold: 50 }];
      mockQuery.mockResolvedValueOnce({ rows: mockRows });

      const result = await dao.getTopSellingProducts(1, startDate, endDate, 5);

      expect(mockQuery).toHaveBeenCalledTimes(1);
      const [sql, params] = mockQuery.mock.calls[0];
      expect(sql).toContain("ph.status = 'COMPLETED'");
      // Se verifica cada condición por separado para evitar problemas con saltos de línea
      expect(sql).toContain('ph.created_at >= $1');
      expect(sql).toContain('ph.created_at <= $2');
      expect(sql).toContain('GROUP BY p.id, p.name');
      expect(sql).toContain('ORDER BY total_quantity_sold DESC');
      expect(sql).toContain('LIMIT $4');
      expect(params).toEqual([startDate, endDate, 1, 5]);
      expect(result).toEqual(mockRows);
    });

    it('debe devolver el ranking ordenado de mayor a menor cantidad', async () => {
      const sortedRows = [
        { product_id: 1, product_name: 'Pizza', total_quantity_sold: 100 },
        { product_id: 2, product_name: 'Pasta', total_quantity_sold: 80 },
        { product_id: 3, product_name: 'Ensalada', total_quantity_sold: 60 },
      ];
      mockQuery.mockResolvedValueOnce({ rows: sortedRows });

      const result = await new RankingDAO().getTopSellingProducts(1, new Date(), new Date(), 5);
      expect(result).toEqual(sortedRows);
    });
  });

  describe('Lógica de negocio (RankingController)', () => {
    const controller = new RankingController();

    it('debe invocar al DAO y devolver el ranking calculado', async () => {
      const spyDao = jest.spyOn(RankingDAO.prototype, 'getTopSellingProducts')
        .mockResolvedValue([{ product_id: 1, product_name: 'Taco', total_quantity_sold: 30 }]);
      const spyName = jest.spyOn(RankingDAO.prototype, 'getRestaurantName')
        .mockResolvedValue('Taquería');

      const start = new Date('2024-01-01');
      const end = new Date('2024-01-07');
      const result = await controller.getTopSellingProducts(1, start, end, 5);

      expect(spyDao).toHaveBeenCalledWith(1, start, end, 5);
      expect(result.ranking).toHaveLength(1);
      expect(result.ranking[0].product_name).toBe('Taco');
      expect(result.restaurantName).toBe('Taquería');

      spyDao.mockRestore();
      spyName.mockRestore();
    });
  });
});