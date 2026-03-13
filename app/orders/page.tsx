"use client"
import { useEffect, useState } from "react"

interface Order {
    id: number;
    status: string;
    total_amount: number;
}

export default function OrdersPage(){

    const [orders,setOrders] = useState<Order[]>([])

    useEffect(()=>{
        fetch("/api/orders")
        .then(res=>res.json())
        .then((data: Order[])=>setOrders(data))
    },[])

    const cancelOrder = async (id:number) => {

        await fetch("/api/orders/cancel",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                orderId:id
            })
        })

        alert("Pedido cancelado")

        location.reload()
    }

    return(

        <div style={{padding:"40px"}}>

            <h1>Pedidos</h1>

            <table border={1} cellPadding={10}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Status</th>
                        <th>Total</th>
                        <th>Acción</th>
                    </tr>
                </thead>

                <tbody>

                    {orders.map((o)=> (
                        <tr key={o.id}>
                            <td>{o.id}</td>
                            <td>{o.status}</td>
                            <td>${o.total_amount}</td>

                            <td>
                                {o.status !== "CANCELLED" && (
                                    <button
                                    onClick={()=>cancelOrder(o.id)}
                                    >
                                    Cancelar / Reembolsar
                                    </button>
                                )}
                            </td>

                        </tr>
                    ))}

                </tbody>

            </table>

        </div>

    )
}
