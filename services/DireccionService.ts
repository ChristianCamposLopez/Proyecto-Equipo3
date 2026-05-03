// services/DireccionService.ts
/**
 * Capa de Servicios para Direcciones de Entrega
 * US014: Lógica de negocio para gestión de direcciones
 */

import { DireccionDAO } from "@/models/daos/DireccionDAO";

export class DireccionService {

  async obtenerMisDirecciones(customerId: number) {
    return await DireccionDAO.getByCustomer(customerId);
  }

  async registrarDireccion(customerId: number, datos: any) {
    if (!datos.address_line || !datos.city) {
      throw new Error("La dirección y ciudad son requeridas");
    }
    return await DireccionDAO.crear(customerId, datos);
  }

  async eliminarDireccion(id: number) {
    await DireccionDAO.eliminar(id);
  }
}
