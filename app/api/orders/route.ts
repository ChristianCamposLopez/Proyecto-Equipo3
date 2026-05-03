import { NextResponse, NextRequest } from "next/server";
import { PedidoService } from "@/services/PedidoService";
import { db } from "@/config/db";

const pedidoService = new PedidoService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");
    const deliverymanId = searchParams.get("deliverymanId");
    const status = searchParams.get("status");
    
    let query = `
      SELECT
          o.id,
          o.customer_id,
          o.restaurant_id,
          o.deliveryman_id,
          o.status,
          o.note,
          o.total_amount::float8 AS total_amount,
          o.created_at,
          (o.created_at + INTERVAL '45 minutes') AS estimated_delivery_at,
          u.full_name AS deliveryman_name,
          c.full_name AS customer_name,
          o.delivery_address_json
      FROM orders o
      LEFT JOIN users u ON u.id = o.deliveryman_id
      LEFT JOIN users c ON c.id = o.customer_id
      WHERE 1=1
    `;
    
    const params = [];

    if (customerId) {
      params.push(parseInt(customerId));
      query += ` AND o.customer_id = $${params.length}`;
    }

    if (deliverymanId) {
      params.push(parseInt(deliverymanId));
      query += ` AND (o.deliveryman_id = $${params.length} OR o.deliveryman_id IS NULL)`;
    }

    if (status) {
      params.push(status);
      query += ` AND o.status = $${params.length}`;
    }

    query += ` ORDER BY o.created_at DESC`;

    const result = await db.query(query, params);
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
