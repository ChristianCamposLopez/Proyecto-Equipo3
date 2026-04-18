// services/ScheduleService.ts
// Capa de servicio — US020: Control de Disponibilidad Horaria

import { ScheduleDAO } from '@/models/daos/ScheduleDAO';
import { Schedule } from '@/models/entities/Schedule';

/**
 * ScheduleService — Lógica de negocio para horarios de disponibilidad.
 * US020: Sistema base de ocultar/mostrar según horario
 * US020.1-3: Alta, edición, eliminación de horarios
 * US020.4: Consulta de horarios
 */
export class ScheduleService {
  private scheduleDAO: ScheduleDAO;

  constructor() {
    this.scheduleDAO = new ScheduleDAO();
  }

  /**
   * US020.4: Obtiene todos los horarios.
   */
  async getAll(): Promise<Schedule[]> {
    return this.scheduleDAO.getAll();
  }

  /**
   * Obtiene horarios de un producto específico.
   */
  async getByProductId(productId: number): Promise<Schedule[]> {
    return this.scheduleDAO.getByProductId(productId);
  }

  /**
   * US020.1: Crea un nuevo rango horario con validaciones.
   */
  async create(
    productId: number,
    dayOfWeek: number,
    startTime: string,
    endTime: string
  ): Promise<Schedule> {
    // Validar día de la semana
    if (dayOfWeek < 0 || dayOfWeek > 6) {
      throw new Error('El día de la semana debe estar entre 0 (Domingo) y 6 (Sábado)');
    }

    // Validar formato de hora (HH:MM)
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      throw new Error('Las horas deben estar en formato HH:MM');
    }

    // Validar que hora inicio < hora fin
    if (startTime >= endTime) {
      throw new Error('La hora de inicio debe ser anterior a la hora de fin');
    }

    return this.scheduleDAO.create(productId, dayOfWeek, startTime, endTime);
  }

  /**
   * US020.2: Edita un rango horario existente.
   */
  async update(
    id: number,
    dayOfWeek: number,
    startTime: string,
    endTime: string
  ): Promise<Schedule> {
    if (dayOfWeek < 0 || dayOfWeek > 6) {
      throw new Error('El día de la semana debe estar entre 0 (Domingo) y 6 (Sábado)');
    }

    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      throw new Error('Las horas deben estar en formato HH:MM');
    }

    if (startTime >= endTime) {
      throw new Error('La hora de inicio debe ser anterior a la hora de fin');
    }

    return this.scheduleDAO.update(id, dayOfWeek, startTime, endTime);
  }

  /**
   * US020.3: Elimina un rango horario.
   */
  async delete(id: number): Promise<void> {
    return this.scheduleDAO.delete(id);
  }

  /**
   * US020: Obtiene los IDs de productos disponibles en este momento.
   */
  async getAvailableProductIds(): Promise<number[]> {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Domingo
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    return this.scheduleDAO.getAvailableProductIds(dayOfWeek, currentTime);
  }
}
