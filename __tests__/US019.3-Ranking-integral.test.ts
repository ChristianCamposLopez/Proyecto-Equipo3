import { RankingService } from '@/services/RankingService';
import { GET } from '@/app/api/ranking/route';
import { NextRequest } from 'next/server';
import { db } from '@/config/db';
import { RankingDAO } from '@/models/daos/RankingDAO';

jest.mock('@/config/db', () => ({
  db: { query: jest.fn() },
}));

const mockQuery = db.query as jest.Mock;

describe('US019.3 – Filtrar por rango de fechas (API y validaciones)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('API Endpoint (GET /api/ranking)', () => {
    it('debe parsear correctamente los parámetros startDate, endDate y topN', async () => {
      const spyService = jest.spyOn(RankingService.prototype, 'getTopSellingProducts')
        .mockResolvedValue({ ranking: [], restaurantName: 'Test' });

      const req = new NextRequest(
        'http://localhost/api/ranking?startDate=2024-01-01T00:00:00.000Z&endDate=2024-01-31T23:59:59.999Z&topN=3'
      );
      await GET(req);

      expect(spyService).toHaveBeenCalledWith(
        1,
        expect.any(Date),
        expect.any(Date),
        3
      );
      spyService.mockRestore();
    });

  });

  describe('Validaciones de fechas en el controlador', () => {
    const controller = new RankingService();

    it('debe rechazar si la fecha de inicio es posterior o igual a la fecha de fin', async () => {
      const start = new Date('2024-02-01');
      const end = new Date('2024-01-01');
      await expect(controller.getTopSellingProducts(1, start, end, 5))
        .rejects.toThrow('La fecha de inicio debe ser anterior a la fecha de fin');
    });

    it('debe rechazar rangos mayores a 6 meses', async () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-08-01'); // 7 meses después
      await expect(controller.getTopSellingProducts(1, start, end, 5))
        .rejects.toThrow('El rango de fechas no puede exceder 6 meses');
    });

    it('debe aceptar rangos de exactamente 6 meses', async () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-07-01'); // 6 meses después
      const spyDao = jest.spyOn(RankingDAO.prototype, 'getTopSellingProducts')
        .mockResolvedValue([]);
      jest.spyOn(RankingDAO.prototype, 'getRestaurantName').mockResolvedValue('Resto');

      await expect(controller.getTopSellingProducts(1, start, end, 5))
        .resolves.not.toThrow();
      spyDao.mockRestore();
    });
  });

  describe('Persistencia – uso de fechas en la consulta', () => {
    it('debe pasar las fechas correctamente como parámetros $1 y $2', async () => {
      const dao = new RankingDAO();
      const start = new Date('2024-05-01');
      const end = new Date('2024-05-31');
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await dao.getTopSellingProducts(1, start, end, 5);
      const params = mockQuery.mock.calls[0][1];
      expect(params[0]).toBe(start);
      expect(params[1]).toBe(end);
    });
  });
});