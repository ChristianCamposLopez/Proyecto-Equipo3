import { AvailabilityRepository } from './repositories/availability.repository';

export class AvailabilityService {
  private repository: AvailabilityRepository;

  constructor() {
    this.repository = new AvailabilityRepository();
  }

  /* =========================================
     Obtener horarios
  ========================================= */
  async getByProduct(productId: number) {
    if (!productId || isNaN(productId)) {
      throw new Error('Invalid productId');
    }

    return await this.repository.getByProductId(productId);
  }

  /* =========================================
     Crear horario
  ========================================= */
  async create(data: {
    productId: number;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }) {
    const { productId, dayOfWeek, startTime, endTime } = data;

    /* Validaciones básicas */
    if (startTime >= endTime) {
      throw new Error('startTime must be less than endTime');
    }

    if (dayOfWeek < 0 || dayOfWeek > 6) {
      throw new Error('Invalid dayOfWeek');
    }

    /* Validar solapamiento */
    const overlap = await this.repository.hasOverlapCreate(
      productId,
      dayOfWeek,
      startTime,
      endTime
    );

    if (overlap) {
      throw new Error('Schedule overlaps with existing one');
    }

    return await this.repository.create(data);
  }

  /* =========================================
     Actualizar horario
  ========================================= */
  async update(
    id: number,
    data: {
      dayOfWeek: number;
      startTime: string;
      endTime: string;
    }
  ) {
    const { dayOfWeek, startTime, endTime } = data;

    if (startTime >= endTime) {
      throw new Error('startTime must be less than endTime');
    }

    const overlap = await this.repository.hasOverlapUpdate(
      id,
      dayOfWeek,
      startTime,
      endTime
    );

    if (overlap) {
      throw new Error('Schedule overlaps with existing one');
    }

    const updated = await this.repository.update(id, data);

    if (!updated) {
      throw new Error('Not found');
    }

    return updated;
  }

  /* =========================================
     Eliminar horario
  ========================================= */
  async delete(id: number) {
    const deleted = await this.repository.delete(id);

    if (!deleted) {
      throw new Error('Not found');
    }

    return true;
  }
}