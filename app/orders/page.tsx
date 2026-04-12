"use client"

import { useEffect, useState } from "react"

interface Order {
    id: number;
    status: string;
    total_amount: number;
    deliveryman_id: number | null;
    deliveryman_name: string | null;
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])

    useEffect(() => {
        fetch("/api/orders")
            .then(res => res.json())
            .then((data: Order[]) => setOrders(data))
    }, [])

    const cancelOrder = async (id: number) => {
        await fetch("/api/orders/cancel", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                orderId: id
            })
        })

        alert("Pedido cancelado")
        location.reload();
    }

    const assignDeliveryman = async (id: number) => {
        const res = await fetch("/api/orders/assign-deliveryman", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: id })
        });
        const data = await res.json();
        if (data.success) {
            alert("Repartidor asignado: " + (data.deliveryman?.full_name || ""));
        } else {
            alert(data.error || "No se pudo asignar repartidor");
        }
        location.reload();
    };

    return (
        <div style={{ padding: "40px", fontFamily: "Arial, sans-serif", backgroundColor: "#fff" }}>
            <h1 style={{ color: "#333" }}>Pedidos</h1>
            <table style={{
                borderCollapse: "collapse",
                width: "100%",
                marginTop: "20px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}>
                <thead>
                    <tr style={{ backgroundColor: "#4CAF50" }}>
                        <th style={{ border: "1px solid #ddd", padding: "12px", textAlign: "left", color: "#fff", fontWeight: "bold" }}>ID</th>
                        <th style={{ border: "1px solid #ddd", padding: "12px", textAlign: "left", color: "#fff", fontWeight: "bold" }}>Status</th>
                        <th style={{ border: "1px solid #ddd", padding: "12px", textAlign: "left", color: "#fff", fontWeight: "bold" }}>Total</th>
                        <th style={{ border: "1px solid #ddd", padding: "12px", textAlign: "left", color: "#fff", fontWeight: "bold" }}>Acción</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.length === 0 ? (
                        <tr>
                            <td colSpan={4} style={{ border: "1px solid #ddd", padding: "12px", textAlign: "center", color: "#999" }}>
                                No hay pedidos disponibles
                            </td>
                        </tr>
                    ) : (
                        orders.map((o) => (
                            <tr key={o.id} style={{ backgroundColor: o.id % 2 === 0 ? "#f9f9f9" : "#fff" }}>
                                <td style={{ border: "1px solid #ddd", padding: "12px", color: "#333", fontWeight: "bold" }}>{o.id}</td>
                                <td style={{ border: "1px solid #ddd", padding: "12px", color: "#333" }}>
                                    <span style={{
                                        padding: "4px 8px",
                                        borderRadius: "4px",
                                        backgroundColor: 
                                            o.status === "READY" ? "#fff3cd" :
                                            o.status === "PREPARING" ? "#e2e3e5" :
                                            o.status === "DELIVERY_ASSIGNED" ? "#d4edda" :
                                            o.status === "ON_DELIVERY" ? "#d1ecf1" :
                                            "#f8d7da",
                                        color:
                                            o.status === "READY" ? "#856404" :
                                            o.status === "PREPARING" ? "#383d41" :
                                            o.status === "DELIVERY_ASSIGNED" ? "#155724" :
                                            o.status === "ON_DELIVERY" ? "#0c5460" :
                                            "#721c24"
                                    }}>
                                        {o.status}
                                    </span>
                                </td>
                                <td style={{ border: "1px solid #ddd", padding: "12px", color: "#333", fontWeight: "bold" }}>${o.total_amount}</td>
                                <td style={{ border: "1px solid #ddd", padding: "12px", display: "flex", gap: "8px" }}>
                                    {o.status !== "CANCELLED" && (
                                        <button 
                                            onClick={() => cancelOrder(o.id)}
                                            style={{
                                                padding: "8px 12px",
                                                backgroundColor: "#dc3545",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "4px",
                                                cursor: "pointer",
                                                fontSize: "12px",
                                                fontWeight: "bold"
                                            }}
                                        >
                                            Cancelar
                                        </button>
                                    )}
                                    {o.status === "READY" && (
                                        <button 
                                            onClick={() => assignDeliveryman(o.id)}
                                            style={{
                                                padding: "8px 12px",
                                                backgroundColor: "#28a745",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "4px",
                                                cursor: "pointer",
                                                fontSize: "12px",
                                                fontWeight: "bold"
                                            }}
                                        >
                                            Asignar Repartidor
                                        </button>
                                    )}
                                    {o.status === "DELIVERY_ASSIGNED" && (
                                        <span style={{ color: "#28a745", padding: "8px 12px", fontWeight: "bold" }}>✓ Asignado</span>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
