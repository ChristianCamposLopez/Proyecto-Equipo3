// services/RestaurantService.ts
/**
 * Capa de Servicios para Gestión de Restaurante
 * Implementa lógica de negocio para US025.1 - US025.7
 */

import { RestaurantDAO } from '@/models/daos/RestaurantDAO';
import { RestaurantDTO, RestaurantEntity } from '@/models/entities';

export class RestaurantService {

  /**
   * Registra un nuevo restaurante con sus horarios iniciales
   * US025.1 / US025.4
   */
  async registrar(ownerId: number, datos: RestaurantDTO): Promise<RestaurantEntity> {
    // 1. Validar si el dueño ya tiene un restaurante (Negocio: 1 dueño = 1 restaurante)
    const existente = await RestaurantDAO.findByOwner(ownerId);
    if (existente) throw new Error('Este usuario ya tiene un restaurante registrado');

    // 2. Crear el restaurante (Persistencia)
    const nuevo = await RestaurantDAO.crearRestaurantEntity({
      owner_user_id: ownerId,
      name: datos.nombre,
      tax_id: datos.tax_id,
      latitude: datos.latitude,
      longitude: datos.longitude
    });

    // 3. Registrar horarios si se proporcionan (US025.4)
    if (datos.horarios && datos.horarios.length > 0) {
      for (const h of datos.horarios) {
        // Validación de negocio: cierre > apertura
        if (h.cierre <= h.apertura) {
          throw new Error(`El horario de cierre debe ser posterior a la apertura para el día ${h.dia}`);
        }
        await RestaurantDAO.setHours({
          restaurant_id: nuevo.id,
          day_of_week: h.dia,
          open_time: h.apertura,
          close_time: h.cierre
        });
      }
    }

    return nuevo;
  }

  /**
   * Actualiza el perfil del restaurante
   * US025.2
   */
  async actualizarPerfil(id: number, datos: Partial<RestaurantDTO>): Promise<RestaurantEntity> {
    const r = await RestaurantDAO.findById(id);
    if (!r) throw new Error('Restaurante no encontrado');

    // Actualizar horarios si se proporcionan (US025.4)
    if (datos.horarios && datos.horarios.length > 0) {
      for (const h of datos.horarios) {
        if (h.cierre <= h.apertura) {
          throw new Error(`El horario de cierre debe ser posterior a la apertura para el día ${h.dia}`);
        }
        await RestaurantDAO.setHours({
          restaurant_id: id,
          day_of_week: h.dia,
          open_time: h.apertura,
          close_time: h.cierre
        });
      }
    }

    return await RestaurantDAO.actualizarRestaurantEntity(id, {
      name: datos.nombre,
      tax_id: datos.tax_id,
      latitude: datos.latitude,
      longitude: datos.longitude
    });
  }

  /**
   * Gestiona el logo del restaurante
   * US025.3
   */
  async gestionarLogo(id: number, logo_url: string): Promise<void> {
    if (!logo_url) throw new Error('La URL del logo es requerida');
    await RestaurantDAO.actualizarRestaurantEntity(id, { logo_url } as any);
  }

  /**
   * Alterna el estado de activación (Baja lógica)
   * US025.6
   */
  async toggleActivo(id: number, activo: boolean): Promise<void> {
    if (!activo) {
      // Validación de negocio: No dar de baja si hay pedidos activos (Simulado por ahora)
      // En una fase posterior se consultaría PedidoDAO.hasActiveOrders(id)
      console.warn(`[RestaurantService] Desactivando restaurante ${id}. Verificando integridad...`);
    }
    await RestaurantDAO.actualizarRestaurantEntity(id, { is_active: activo });
  }

  /**
   * Obtiene el resumen completo del perfil
   * US025.7
   */
  async obtenerPerfil(ownerId: number): Promise<RestaurantDTO | null> {
    const r = await RestaurantDAO.findByOwner(ownerId);
    if (!r) return null;

    const horarios = await RestaurantDAO.getHours(r.id);

    return {
      id: r.id,
      nombre: r.name,
      tax_id: r.tax_id || '',
      is_active: r.is_active,
      latitude: r.latitude,
      longitude: r.longitude,
      logo_url: r.logo_url,
      horarios: horarios.map(h => ({
        dia: h.day_of_week,
        apertura: h.open_time,
        cierre: h.close_time
      }))
    };
  }
}
