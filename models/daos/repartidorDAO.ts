// models/daos/repartidorDAO.ts
import { db } from '@/config/db';
import { Repartidor } from '../entities/repartidoresEntitiy';

export class RepartidorDAO {
  async getOrderAutoAssignInfo(orderId: number): Promise<{ exists: boolean; alreadyAssigned: boolean }> {
    const result = await db.query('SELECT deliveryman_id FROM orders WHERE id = $1', [orderId]);
    if (result.rows.length === 0) return { exists: false, alreadyAssigned: false };
    return { exists: true, alreadyAssigned: result.rows[0].deliveryman_id !== null };
  }

  async findAvailableRepartidor(): Promise<Repartidor | null> {
    const query = `
      SELECT u.id, u.full_name, u.email, u.phone_number
      FROM users u
      INNER JOIN user_roles ur ON u.id = ur.user_id
      INNER JOIN roles r ON ur.role_id = r.id
      WHERE r.name = 'repartidor'
        AND u.id NOT IN (
          SELECT DISTINCT deliveryman_id
          FROM orders
          WHERE deliveryman_id IS NOT NULL AND status = 'DELIVERY_ASSIGNED'
        )
      LIMIT 1
    `;
    const result = await db.query(query);
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      id: row.id,
      full_name: row.full_name,
      email: row.email,
      phone_number: row.phone_number,
      activo: true,
    };
  }

  async assignDeliverymanToOrder(orderId: number, deliverymanId: number): Promise<void> {
    await db.query(
      `UPDATE orders SET deliveryman_id = $1, status = 'DELIVERY_ASSIGNED' WHERE id = $2`,
      [deliverymanId, orderId]
    );
  }
}