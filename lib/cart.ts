import { db } from "@/config/db";
import { getDeliveryAddressSnapshot } from "@/lib/deliveryAddresses";

export type CartItem = {
  id: number;
  product_id: number;
  product_name: string;
  category_name: string;
  image_url: string | null;
  quantity: number;
  available_stock: number;
  is_available: boolean;
  unit_price: number;
  subtotal: number;
};

export type CartSummary = {
  id: number;
  customer_id: number;
  restaurant_id: number | null;
  restaurant_name: string | null;
  item_count: number;
  total_quantity: number;
  total_amount: number;
  items: CartItem[];
};

export type CreatedOrder = {
  id: number;
  customer_id: number;
  restaurant_id: number;
  status: string;
  note: string | null;
  delivery_address_json: unknown;
  total_amount: number;
  created_at: string;
};

export function resolveCustomerId(rawValue: unknown): number {
  const parsed = Number(rawValue);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

export function normalizeOrderNote(rawValue: unknown): string | null {
  if (rawValue === undefined || rawValue === null) {
    return null;
  }

  const note = String(rawValue).trim();
  if (!note) {
    return null;
  }

  if (note.length > 200) {
    throw new Error("La nota no puede exceder 200 caracteres");
  }

  return note;
}

export async function getOrCreateActiveCart(customerId: number) {
  const existing = await db.query(
    `SELECT id, customer_id, restaurant_id
     FROM carts
     WHERE customer_id = $1 AND status = 'ACTIVE'
     LIMIT 1`,
    [customerId]
  );

  if (existing.rows[0]) {
    return existing.rows[0] as { id: number; customer_id: number; restaurant_id: number | null };
  }

  const created = await db.query(
    `INSERT INTO carts (customer_id, status)
     VALUES ($1, 'ACTIVE')
     RETURNING id, customer_id, restaurant_id`,
    [customerId]
  );

  return created.rows[0] as { id: number; customer_id: number; restaurant_id: number | null };
}

export async function buildCartSummary(customerId: number): Promise<CartSummary> {
  const cart = await getOrCreateActiveCart(customerId);
  const itemsResult = await db.query(
    `SELECT
          ci.id,
          ci.product_id,
          p.name AS product_name,
          c.name AS category_name,
          COALESCE(pi.image_path, p.image_url) AS image_url,   -- ← prioriza product_images
          ci.quantity,
          p.stock AS available_stock,
          p.is_available,
          ci.unit_price::float8 AS unit_price,
          (ci.quantity * ci.unit_price)::float8 AS subtotal
      FROM cart_items ci
      JOIN products p ON p.id = ci.product_id
      JOIN categories c ON c.id = p.category_id
      LEFT JOIN product_images pi 
          ON pi.product_id = p.id 
          AND pi.is_primary = true 
          AND pi.deleted_at IS NULL   -- si usas borrado lógico
      WHERE ci.cart_id = $1
      ORDER BY ci.created_at ASC, ci.id ASC`,
    [cart.id]
  );

  const restaurantResult = cart.restaurant_id
    ? await db.query(`SELECT name FROM restaurants WHERE id = $1`, [cart.restaurant_id])
    : { rows: [] };

  const items = itemsResult.rows as CartItem[];
  const item_count = items.length;
  const total_quantity = items.reduce((sum, item) => sum + Number(item.quantity), 0);
  const total_amount = items.reduce((sum, item) => sum + Number(item.subtotal), 0);

  return {
    id: cart.id,
    customer_id: cart.customer_id,
    restaurant_id: cart.restaurant_id,
    restaurant_name: restaurantResult.rows[0]?.name ?? null,
    item_count,
    total_quantity,
    total_amount,
    items,
  };
}

export async function addItemToCart(customerId: number, productId: number, quantity: number) {
  const safeQuantity = Number.isInteger(quantity) && quantity > 0 ? quantity : 1;
  const cart = await getOrCreateActiveCart(customerId);

  const productResult = await db.query(
    `SELECT
        p.id,
        p.name,
        p.base_price::float8 AS base_price,
        p.stock,
        p.is_available,
        c.restaurant_id
      FROM products p
      JOIN categories c ON c.id = p.category_id
      WHERE p.id = $1`,
    [productId]
  );

  const product = productResult.rows[0];
  if (!product) {
    throw new Error("Producto no encontrado");
  }

  if (!product.is_available || Number(product.stock) <= 0) {
    throw new Error("El producto no está disponible");
  }

  if (cart.restaurant_id && Number(cart.restaurant_id) !== Number(product.restaurant_id)) {
    throw new Error("No es posible mezclar productos de distintos restaurantes en el mismo carrito");
  }

  const existingItemResult = await db.query(
    `SELECT id, quantity
     FROM cart_items
     WHERE cart_id = $1 AND product_id = $2`,
    [cart.id, productId]
  );

  const currentQuantity = Number(existingItemResult.rows[0]?.quantity ?? 0);
  const nextQuantity = currentQuantity + safeQuantity;

  if (nextQuantity > Number(product.stock)) {
    throw new Error("La cantidad solicitada supera el stock disponible");
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    if (!cart.restaurant_id) {
      await client.query(
        `UPDATE carts
         SET restaurant_id = $1, updated_at = NOW()
         WHERE id = $2`,
        [product.restaurant_id, cart.id]
      );
    }

    if (existingItemResult.rows[0]) {
      await client.query(
        `UPDATE cart_items
         SET quantity = $1, updated_at = NOW()
         WHERE id = $2`,
        [nextQuantity, existingItemResult.rows[0].id]
      );
    } else {
      await client.query(
        `INSERT INTO cart_items (cart_id, product_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
        [cart.id, productId, safeQuantity, product.base_price]
      );
    }

    await client.query(`UPDATE carts SET updated_at = NOW() WHERE id = $1`, [cart.id]);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  return buildCartSummary(customerId);
}

export async function updateCartItemQuantity(customerId: number, cartItemId: number, quantity: number) {
  if (!Number.isInteger(quantity)) {
    throw new Error("La cantidad debe ser un entero");
  }

  const cart = await getOrCreateActiveCart(customerId);

  const itemResult = await db.query(
    `SELECT
        ci.id,
        ci.product_id,
        p.stock,
        p.is_available
      FROM cart_items ci
      JOIN products p ON p.id = ci.product_id
      WHERE ci.id = $1 AND ci.cart_id = $2`,
    [cartItemId, cart.id]
  );

  const item = itemResult.rows[0];
  if (!item) {
    throw new Error("Elemento del carrito no encontrado");
  }

  if (quantity <= 0) {
    await db.query(`DELETE FROM cart_items WHERE id = $1 AND cart_id = $2`, [cartItemId, cart.id]);
    await db.query(`UPDATE carts SET updated_at = NOW() WHERE id = $1`, [cart.id]);
    return buildCartSummary(customerId);
  }

  if (!item.is_available || quantity > Number(item.stock)) {
    throw new Error("La cantidad solicitada no está disponible");
  }

  await db.query(
    `UPDATE cart_items
     SET quantity = $1, updated_at = NOW()
     WHERE id = $2 AND cart_id = $3`,
    [quantity, cartItemId, cart.id]
  );
  await db.query(`UPDATE carts SET updated_at = NOW() WHERE id = $1`, [cart.id]);

  return buildCartSummary(customerId);
}

export async function removeCartItem(customerId: number, cartItemId: number) {
  const cart = await getOrCreateActiveCart(customerId);
  await db.query(`DELETE FROM cart_items WHERE id = $1 AND cart_id = $2`, [cartItemId, cart.id]);
  await db.query(`UPDATE carts SET updated_at = NOW() WHERE id = $1`, [cart.id]);

  const summary = await buildCartSummary(customerId);
  if (summary.item_count === 0 && summary.restaurant_id) {
    await db.query(
      `UPDATE carts
       SET restaurant_id = NULL, updated_at = NOW()
       WHERE id = $1`,
      [cart.id]
    );
    return buildCartSummary(customerId);
  }

  return summary;
}

export async function clearCart(customerId: number) {
  const cart = await getOrCreateActiveCart(customerId);
  await db.query(`DELETE FROM cart_items WHERE cart_id = $1`, [cart.id]);
  await db.query(
    `UPDATE carts
     SET restaurant_id = NULL, updated_at = NOW()
     WHERE id = $1`,
    [cart.id]
  );
  return buildCartSummary(customerId);
}

export async function checkoutCart(customerId: number, rawNote: unknown, rawDeliveryAddressId: unknown): Promise<CreatedOrder> {
  const note = normalizeOrderNote(rawNote);
  const deliveryAddressId = Number(rawDeliveryAddressId);

  if (!Number.isInteger(deliveryAddressId) || deliveryAddressId <= 0) {
    throw new Error("Selecciona una dirección de entrega");
  }

  const deliveryAddress = await getDeliveryAddressSnapshot(customerId, deliveryAddressId);
  const cart = await getOrCreateActiveCart(customerId);

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const itemsResult = await client.query(
      `SELECT
          ci.product_id,
          ci.quantity,
          ci.unit_price,
          p.stock,
          p.is_available
        FROM cart_items ci
        JOIN products p ON p.id = ci.product_id
        WHERE ci.cart_id = $1
        ORDER BY ci.created_at ASC, ci.id ASC`,
      [cart.id]
    );

    if (itemsResult.rows.length === 0) {
      throw new Error("El carrito está vacío");
    }

    if (!cart.restaurant_id) {
      throw new Error("El carrito no tiene restaurante asignado");
    }

    for (const item of itemsResult.rows) {
      if (!item.is_available || Number(item.quantity) > Number(item.stock)) {
        throw new Error("Uno de los productos ya no está disponible en la cantidad solicitada");
      }
    }

    const totalAmount = itemsResult.rows.reduce(
      (sum, item) => sum + Number(item.quantity) * Number(item.unit_price),
      0
    );

    const orderResult = await client.query(
      `INSERT INTO orders (customer_id, restaurant_id, delivery_address_json, status, note, total_amount)
       VALUES ($1, $2, $3, 'PENDING', $4, $5)
       RETURNING
        id,
        customer_id,
        restaurant_id,
        delivery_address_json,
        status,
        note,
        total_amount::float8 AS total_amount,
        created_at`,
      [customerId, cart.restaurant_id, JSON.stringify(deliveryAddress), note, totalAmount]
    );

    const order = orderResult.rows[0] as CreatedOrder;

    for (const item of itemsResult.rows) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price_at_purchase)
         VALUES ($1, $2, $3, $4)`,
        [order.id, item.product_id, item.quantity, item.unit_price]
      );

      await client.query(
        `UPDATE products
         SET stock = stock - $1,
             is_available = CASE WHEN stock - $1 <= 0 THEN FALSE ELSE is_available END
         WHERE id = $2`,
        [item.quantity, item.product_id]
      );
    }

    await client.query(
      `UPDATE carts
       SET status = 'CHECKED_OUT', updated_at = NOW()
       WHERE id = $1`,
      [cart.id]
    );

    await client.query("COMMIT");
    return order;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
