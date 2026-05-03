"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type KitchenOrderItem = {
  product_name: string
  quantity: number
}

type KitchenOrder = {
  id: number
  status: string
  note: string | null
  total_amount: number
  created_at: string
  customer_name: string | null
  items: KitchenOrderItem[]
}

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  PREPARING: "En preparación",
  READY: "Listo",
}

export default function KitchenPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<KitchenOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [role, setRole] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  useEffect(() => {
    const savedRole = sessionStorage.getItem("userRole")
    if (savedRole !== "chef" && savedRole !== "admin" && savedRole !== "restaurant_admin") {
      router.replace("/login")
    } else {
      setRole(savedRole)
      setAuthorized(true)
      loadOrders()
    }
  }, [router])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/kitchen/orders")
      const data = await response.json()
      if (response.ok) {
        setOrders(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error("Error cargando pedidos de cocina", error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId)
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })
      if (response.ok) {
        // Actualizar localmente para feedback inmediato
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
        // Recargar para limpiar la lista si ya no debería estar en cocina
        if (newStatus === "READY") {
          setTimeout(loadOrders, 1000)
        }
      }
    } catch (e) {
      console.error("Error actualizando estado", e)
    } finally {
      setUpdatingId(null)
    }
  }

  if (!authorized) return null

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <header className="max-w-6xl mx-auto mb-12 flex justify-between items-end border-b border-zinc-800 pb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-orange-500 uppercase">Monitor de Cocina</h1>
          <p className="text-zinc-500 mt-2">Gestión de preparación en tiempo real (US007)</p>
        </div>
        <button 
          onClick={loadOrders}
          className="bg-zinc-800 hover:bg-zinc-700 px-6 py-2 rounded-full text-sm font-bold transition-all"
        >
          {loading ? "Sincronizando..." : "Refrescar"}
        </button>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-800 rounded-3xl text-zinc-600 font-medium">
            No hay pedidos pendientes en cocina.
          </div>
        )}

        {orders.map((order) => (
          <div key={order.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-start">
              <div>
                <span className="text-xs font-mono text-zinc-500">ORDEN #{order.id}</span>
                <h3 className="text-xl font-bold">{order.customer_name || "Cliente"}</h3>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                order.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 
                'bg-blue-500/10 text-blue-500 border border-blue-500/20'
              }`}>
                {statusLabels[order.status] || order.status}
              </span>
            </div>

            <div className="p-6 flex-1">
              <ul className="space-y-3">
                {order.items.map((item, i) => (
                  <li key={i} className="flex justify-between items-center text-zinc-300">
                    <span className="font-medium">{item.product_name}</span>
                    <span className="bg-zinc-800 px-2 py-0.5 rounded text-sm font-bold">x{item.quantity}</span>
                  </li>
                ))}
              </ul>

              {order.note && (
                <div className="mt-6 p-4 bg-orange-500/5 border border-orange-500/10 rounded-2xl">
                  <span className="text-[10px] font-black text-orange-500 uppercase block mb-1">Nota del Cliente</span>
                  <p className="text-sm italic text-zinc-400">"{order.note}"</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-zinc-900/50 border-t border-zinc-800 grid grid-cols-2 gap-3">
              {order.status === 'PENDING' && (role === 'admin' || role === 'restaurant_admin' || role === 'chef') && (
                <button 
                  onClick={() => updateStatus(order.id, 'PREPARING')}
                  disabled={updatingId === order.id}
                  className="col-span-2 py-3 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold text-sm transition-all"
                >
                  Empezar Preparación
                </button>
              )}
              {order.status === 'PREPARING' && (
                <button 
                  onClick={() => updateStatus(order.id, 'READY')}
                  disabled={updatingId === order.id}
                  className="col-span-2 py-3 bg-green-600 hover:bg-green-500 rounded-2xl font-bold text-sm transition-all text-white"
                >
                  Marcar como Listo
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
