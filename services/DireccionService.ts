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
    const normalized = {
      street: datos.street?.trim(),
      exteriorNumber: datos.exteriorNumber?.trim(),
      interiorNumber: datos.interiorNumber?.trim() || null,
      neighborhood: datos.neighborhood?.trim() || null,
      city: datos.city?.trim(),
      state: datos.state?.trim(),
      postalCode: datos.postalCode?.trim(),
      references: datos.references?.trim() || null,
    };

    if (!normalized.street || !normalized.city) {
      throw new Error("La calle y ciudad son requeridas");
    }

    if (normalized.postalCode && !/^\d{5}$/.test(normalized.postalCode)) {
      throw new Error("El código postal debe tener 5 dígitos");
    }

    return await DireccionDAO.crear(customerId, normalized);
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
