import { db } from "@/config/db";

/**
 * Asigna automáticamente un repartidor disponible a un pedido.
 * - Busca un usuario con rol 'repartidor' que no tenga pedidos en curso.
 * - Actualiza el pedido con el id del repartidor y cambia el estado a 'DELIVERY_ASSIGNED'.
 * - Devuelve info del repartidor asignado o error si no hay disponibles.
 */
export async function assignDeliverymanToOrder(orderId: number) {
    // 1. Buscar repartidores disponibles (no asignados a pedidos en curso)
    const repartidorRes = await db.query(`
        SELECT u.id, u.full_name, u.email
        FROM users u
        JOIN user_roles ur ON u.id = ur.user_id
        JOIN roles r ON ur.role_id = r.id
        WHERE r.name = 'repartidor'
        AND u.id NOT IN (
            SELECT deliveryman_id FROM orders WHERE status IN ('DELIVERY_ASSIGNED', 'ON_DELIVERY')
        )
        LIMIT 1
    `);
    if (repartidorRes.rows.length === 0) {
        throw new Error("No hay repartidores disponibles");
    }
    const repartidor = repartidorRes.rows[0];

    // 2. Actualizar el pedido con el repartidor y estado
    await db.query(
        `UPDATE orders SET deliveryman_id = $1, status = 'DELIVERY_ASSIGNED' WHERE id = $2`,
        [repartidor.id, orderId]
    );

    return { deliveryman: repartidor };
}
