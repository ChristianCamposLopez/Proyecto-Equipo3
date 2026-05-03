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
    if (!datos.street || !datos.city) {
      throw new Error("La calle y ciudad son requeridas");
    }
    return await DireccionDAO.crear(customerId, datos);
  }

  async actualizarDireccion(customerId: number, addressId: number, datos: any) {
    // Por ahora redirigimos al DAO si tuviera update, o implementamos lógica aquí.
    // Como no hay update en el DAO aún, vamos a crearlo.
    return await DireccionDAO.actualizar(addressId, datos);
  }

  async eliminarDireccion(id: number) {
    await DireccionDAO.eliminar(id);
  }
}
