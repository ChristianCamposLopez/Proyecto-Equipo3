// controllers/DisponibilidadController.ts
import { DisponibilidadDAO } from "../models/daos/DisponibilidadDAO";

export class DisponibilidadController {
  async getByProduct(productId: number) {
    return await DisponibilidadDAO.getByProductId(productId);
  }

  async create(data: {
    productId: number;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }) {
    if (data.startTime >= data.endTime) {
      throw new Error('startTime must be less than endTime');
    }
    if (data.dayOfWeek < 0 || data.dayOfWeek > 6) {
      throw new Error('Invalid dayOfWeek');
    }
    const overlap = await DisponibilidadDAO.hasOverlap(
      data.productId,
      data.dayOfWeek,
      data.startTime,
      data.endTime
    );
    if (overlap) {
      throw new Error('Schedule overlaps with existing one');
    }
    return await DisponibilidadDAO.create(data);
  }

  async update(id: number, data: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }) {
    if (data.startTime >= data.endTime) {
      throw new Error('startTime must be less than endTime');
    }
    const existing = await DisponibilidadDAO.getById(id);
    if (!existing) throw new Error('Not found');
    const overlap = await DisponibilidadDAO.hasOverlap(
      existing.product_id,
      data.dayOfWeek,
      data.startTime,
      data.endTime,
      id
    );
    if (overlap) throw new Error('Schedule overlaps with existing one');
    const updated = await DisponibilidadDAO.update(id, data);
    if (!updated) throw new Error('Not found');
    return updated;
  }

  async delete(id: number) {
    const deleted = await DisponibilidadDAO.delete(id);
    if (!deleted) throw new Error('Not found');
    return true;
  }
}