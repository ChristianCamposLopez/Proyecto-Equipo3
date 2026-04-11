import { db } from "../../config/db";

export class PedidoDAO {
  static async crearPedido(
    customerId: number,
    restaurantId: number,
    items: { product_id: number; quantity: number }[]
  ) {
    const client = await db.connect();

    try {
      await client.query("BEGIN");

      // 🔹 Traer precios en UNA sola query (optimizado 🔥)
      const productIds = items.map(i => i.product_id);

      const productsResult = await client.query(
        `
        SELECT id, base_price
        FROM products
        WHERE id = ANY($1)
        `,
        [productIds]
      );

      const priceMap = new Map(
        productsResult.rows.map(p => [p.id, Number(p.base_price)])
      );

      // 🔹 Calcular total
      let total = 0;

      for (const item of items) {
        const price = priceMap.get(item.product_id) || 0;
        total += price * item.quantity;
      }

      // 🔹 Insertar pedido
      const pedidoResult = await client.query(
        `
        INSERT INTO pedido_historial (
          customer_id,
          restaurant_id,
          status,
          total_amount
        )
        VALUES ($1, $2, 'PENDING', $3)
        RETURNING id
        `,
        [customerId, restaurantId, total]
      );

      const pedidoId = pedidoResult.rows[0].id;

      // 🔹 Insertar items
      for (const item of items) {
        const price = priceMap.get(item.product_id) || 0;

        await client.query(
          `
          INSERT INTO pedido_items_historial (
            order_id,
            product_id,
            quantity,
            unit_price_at_purchase
          )
          VALUES ($1, $2, $3, $4)
          `,
          [pedidoId, item.product_id, item.quantity, price]
        );
      }

      await client.query("COMMIT");

      return { pedidoId };

    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  static async completarPedido(pedidoId: number) {
    await db.query(
      `
      UPDATE pedido_historial
      SET status = 'COMPLETED'
      WHERE id = $1
      `,
      [pedidoId]
    );
  }

  static async getPedidosByUser(userId: number) {
    const result = await db.query(
      `
      SELECT *
      FROM pedido_historial
      WHERE customer_id = $1
      ORDER BY created_at DESC
      `,
      [userId]
    );

    return result.rows;
  }
}