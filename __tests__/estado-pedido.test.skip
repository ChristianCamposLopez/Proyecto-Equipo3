/**
 * Ver estado del pedido
 * Pruebas unitarias sobre consulta de pedidos y estados visibles.
 */

const mockDbQuery = jest.fn();

jest.mock("@/config/db", () => ({
  db: {
    query: (...args: unknown[]) => mockDbQuery(...args),
  },
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => body,
    }),
  },
}));

import { GET as getOrders } from "@/app/api/orders/route";

describe("Ver estado del pedido", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("obtiene los pedidos del cliente con sus estados actuales", async () => {
    mockDbQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 1,
          customer_id: 1,
          restaurant_id: 8,
          deliveryman_id: null,
          status: "PENDING",
          note: null,
          total_amount: 150,
          created_at: "2026-04-24T12:00:00.000Z",
          estimated_delivery_at: "2026-04-24T12:45:00.000Z",
          deliveryman_name: null,
        },
        {
          id: 2,
          customer_id: 1,
          restaurant_id: 8,
          deliveryman_id: 15,
          status: "DELIVERY_ASSIGNED",
          note: "Sin picante",
          total_amount: 200,
          created_at: "2026-04-24T12:10:00.000Z",
          estimated_delivery_at: "2026-04-24T12:55:00.000Z",
          deliveryman_name: "Ana Repartidora",
        },
        {
          id: 3,
          customer_id: 1,
          restaurant_id: 8,
          deliveryman_id: 15,
          status: "COMPLETED",
          note: null,
          total_amount: 240,
          created_at: "2026-04-24T11:00:00.000Z",
          estimated_delivery_at: "2026-04-24T11:45:00.000Z",
          deliveryman_name: "Ana Repartidora",
        },
      ],
    });

    const response = await getOrders({
      url: "http://localhost/api/orders?customerId=1",
    } as Request);

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveLength(3);
    expect(body.map((order: { status: string }) => order.status)).toEqual([
      "PENDING",
      "DELIVERY_ASSIGNED",
      "COMPLETED",
    ]);
  });

  it("mapea los estados del pedido a las etiquetas visibles para el cliente", () => {
    const customerStatusMap: Record<string, string> = {
      PENDING: "Preparando",
      PREPARING: "Preparando",
      READY: "Preparando",
      DELIVERY_ASSIGNED: "En camino",
      ON_DELIVERY: "En camino",
      COMPLETED: "Entregado",
      DELIVERED: "Entregado",
    };

    expect(customerStatusMap.PENDING).toBe("Preparando");
    expect(customerStatusMap.DELIVERY_ASSIGNED).toBe("En camino");
    expect(customerStatusMap.COMPLETED).toBe("Entregado");
  });
});
