// models/daos/PedidoDAO.ts
import { db } from "../../config/db";

export class PedidoDAO {
/*
  // Crear pedido: inserta en ambas tablas (activo e historial)
  static async crearPedido(
    customerId: number,
    restaurantId: number,
    items: { product_id: number; quantity: number }[]
  ) {
    const client = await db.connect();
    try {
      await client.query("BEGIN");

      // 1. Validar productos y precios
      const productIds = items.map(i => i.product_id);
      const productsRes = await client.query(
        `SELECT id, base_price, stock, is_active FROM products WHERE id = ANY($1)`,
        [productIds]
      );
      if (productsRes.rowCount !== items.length) {
        throw new Error("Algún producto no existe");
      }

      const priceMap = new Map<number, number>();
      for (const row of productsRes.rows) {
        if (!row.is_active) throw new Error(`Producto ${row.id} no está activo`);
        const item = items.find(i => i.product_id === row.id)!;
        if (row.stock < item.quantity) {
          throw new Error(`Stock insuficiente para producto ${row.id}`);
        }
        priceMap.set(row.id, Number(row.base_price));
      }

      let total = 0;
      for (const item of items) {
        total += priceMap.get(item.product_id)! * item.quantity;
      }

      // 2. Insertar en pedido_historial (histórico)
      const historialRes = await client.query(
        `INSERT INTO pedido_historial (customer_id, restaurant_id, status, total_amount)
         VALUES ($1, $2, 'PENDING', $3) RETURNING id`,
        [customerId, restaurantId, total]
      );
      const pedidoId = historialRes.rows[0].id;

      // 3. Insertar en orders (activo)
      await client.query(
        `INSERT INTO orders (id, customer_id, restaurant_id, status, total_amount)
         VALUES ($1, $2, $3, 'PENDING', $4)`,
        [pedidoId, customerId, restaurantId, total]
      );

      // 4. Insertar items en ambas tablas
      for (const item of items) {
        const unitPrice = priceMap.get(item.product_id)!;
        // order_items (activo)
        await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity, unit_price_at_purchase)
           VALUES ($1, $2, $3, $4)`,
          [pedidoId, item.product_id, item.quantity, unitPrice]
        );
        // pedido_items_historial (histórico)
        await client.query(
          `INSERT INTO pedido_items_historial (order_id, product_id, quantity, unit_price_at_purchase)
           VALUES ($1, $2, $3, $4)`,
          [pedidoId, item.product_id, item.quantity, unitPrice]
        );
        // Descontar stock
        await client.query(
          `UPDATE products SET stock = stock - $1 WHERE id = $2`,
          [item.quantity, item.product_id]
        );
      }

      await client.query("COMMIT");
      return { pedidoId };
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  } 
*/
  static async registrarHistorial(
      orderId: number,
      customerId: number,
      restaurantId: number,
      items: { product_id: number; quantity: number }[]
    ) {
      const client = await db.connect();
      try {
        await client.query("BEGIN");

        // Obtener precios unitarios actuales de los productos
        const productIds = items.map(i => i.product_id);
        const productsRes = await client.query(
          `SELECT id, base_price FROM products WHERE id = ANY($1)`,
          [productIds]
        );
        if (productsRes.rowCount !== items.length) {
          throw new Error("Algún producto no existe");
        }

        const priceMap = new Map<number, number>();
        for (const row of productsRes.rows) {
          priceMap.set(row.id, Number(row.base_price));
        }

        let total = 0;
        for (const item of items) {
          total += priceMap.get(item.product_id)! * item.quantity;
        }

        // Insertar en pedido_historial usando el mismo orderId
        await client.query(
          `INSERT INTO pedido_historial (id, customer_id, restaurant_id, status, total_amount)
          VALUES ($1, $2, $3, 'PENDING', $4)
          ON CONFLICT (id) DO NOTHING`,   // Evita duplicados si ya existe
          [orderId, customerId, restaurantId, total]
        );

        // Insertar items en pedido_items_historial
        for (const item of items) {
          const unitPrice = priceMap.get(item.product_id)!;
          await client.query(
            `INSERT INTO pedido_items_historial (order_id, product_id, quantity, unit_price_at_purchase)
            VALUES ($1, $2, $3, $4)`,
            [orderId, item.product_id, item.quantity, unitPrice]
          );
        }

        await client.query("COMMIT");
        return { success: true };
      } catch (e) {
        await client.query("ROLLBACK");
        throw e;
      } finally {
        client.release();
      }
  }

  // Buscar pedido activo (en tabla orders)
  static async findActiveOrderById(id: number) {
    const result = await db.query(`SELECT * FROM orders WHERE id = $1`, [id]);
    return result.rows[0];
  }

  // Cambiar estado en pedido_historial
  static async updateHistorialStatus(id: number, status: string) {
    await db.query(`UPDATE pedido_historial SET status = $1 WHERE id = $2`, [status, id]);
  }

  // Eliminar pedido activo (orders y order_items)
  /*static async deleteActiveOrder(orderId: number) {
    const client = await db.connect();
    try {
      await client.query("BEGIN");
      await client.query(`DELETE FROM order_items WHERE order_id = $1`, [orderId]);
      await client.query(`DELETE FROM orders WHERE id = $1`, [orderId]);
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }*/

  // Cancelar pedido (cliente)
  // models/daos/PedidoDAO.ts

  static async cancelPedido(orderId: number) {
    const client = await db.connect();
    try {
      await client.query("BEGIN");

      // 0. Verificar el estado actual en pedido_historial
      const historialCheck = await client.query(
        `SELECT status FROM pedido_historial WHERE id = $1 FOR UPDATE`,
        [orderId]
      );
      if (historialCheck.rowCount === 0) {
        throw new Error("Pedido no encontrado en el historial");
      }
      const currentStatus = historialCheck.rows[0].status;
      if (currentStatus !== 'PENDING') {
        throw new Error(`No se puede cancelar un pedido en estado '${currentStatus}'. Solo se permite cancelar pedidos 'PENDING'.`);
      }

      // 1. Cambiar estado en historial a CANCELLED
      await client.query(
        `UPDATE pedido_historial SET status = 'CANCELLED' WHERE id = $1`,
        [orderId]
      );

      // 2. Revertir stock (usando items del historial)
      const items = await client.query(
        `SELECT product_id, quantity FROM pedido_items_historial WHERE order_id = $1`,
        [orderId]
      );
      for (const item of items.rows) {
        await client.query(
          `UPDATE products SET stock = stock + $1 WHERE id = $2`,
          [item.quantity, item.product_id]
        );
      }

      // 3. Eliminar de orders y order_items (si existen, porque puede que ya se hayan eliminado)
      await client.query(`DELETE FROM order_items WHERE order_id = $1`, [orderId]);
      await client.query(`DELETE FROM orders WHERE id = $1`, [orderId]);

      await client.query("COMMIT");
      return { message: "Pedido cancelado. Stock revertido." };
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  // Completar pedido (administrador o sistema)
  static async completarPedido(orderId: number) {
    const client = await db.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        `UPDATE pedido_historial SET status = 'COMPLETED' WHERE id = $1`,
        [orderId]
      );
      await client.query(`DELETE FROM order_items WHERE order_id = $1`, [orderId]);
      await client.query(`DELETE FROM orders WHERE id = $1`, [orderId]); 
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  // Obtener pedidos de un usuario (desde historial)
  static async getPedidosByUser(userId: number) {
    const result = await db.query(
      `SELECT 
        ph.*,
        o.status AS active_status,
        CASE WHEN o.id IS NOT NULL THEN true ELSE false END AS is_active
      FROM pedido_historial ph
      LEFT JOIN orders o ON o.id = ph.id
      WHERE ph.customer_id = $1
      ORDER BY ph.created_at DESC`,
      [userId]
    );
    return result.rows;
  }
}