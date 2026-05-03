import { NextResponse, NextRequest } from "next/server";
import { PedidoService } from "@/services/PedidoService";
import { db } from "@/config/db";

const pedidoService = new PedidoService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");
    
    if (!customerId) {
      // Si no hay customerId, tal vez sea para admin? 
      // Por ahora mantenemos la lógica de DB directa para el listado si es necesario, 
      // pero idealmente debería ir al service.
      const result = await db.query(
        `SELECT o.*, u.full_name AS deliveryman_name
         FROM orders o
         LEFT JOIN users u ON u.id = o.deliveryman_id
         ORDER BY o.created_at DESC`
      );
      return NextResponse.json(result.rows);
    }

    const parsedCustomerId = parseInt(customerId);
    const result = await db.query(
      `SELECT
          o.id,
          o.customer_id,
          o.restaurant_id,
          o.deliveryman_id,
          o.status,
          o.note,
          o.total_amount::float8 AS total_amount,
          o.created_at,
          (o.created_at + INTERVAL '45 minutes') AS estimated_delivery_at,
          u.full_name AS deliveryman_name
      FROM orders o
      LEFT JOIN users u ON u.id = o.deliveryman_id
      WHERE o.customer_id = $1
      ORDER BY o.created_at DESC`,
      [parsedCustomerId]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("[GET /api/orders]", error);
    return NextResponse.json({ error: "No se pudieron obtener los pedidos" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const customerId = parseInt(body.customerId);
    
    if (isNaN(customerId)) {
      return NextResponse.json({ error: "customerId inválido" }, { status: 400 });
    }

    // US002 / US011: Checkout centralizado en el Service
    const result = await pedidoService.checkout(
      customerId, 
      body.note, 
      body.deliveryAddressId
    );

    return NextResponse.json({ id: result.orderId, success: true }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo crear el pedido";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
