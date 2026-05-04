"use client"

import Image from "next/image"
import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/app/_components/ui/Button"
import { PedidoEntity, CartItem, CartSummary, DeliveryAddress, AddressForm } from "@/models/entities"

const ORDER_REFRESH_MS = 10000

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  PREPARING: "Preparando",
  READY: "Listo para entregar",
  DELIVERY_ASSIGNED: "Asignado a repartidor",
  ON_DELIVERY: "En camino",
  COMPLETED: "Entregado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
  CONFIRMED: "Confirmado",
}

const emptyAddressForm: AddressForm = {
  street: "",
  exteriorNumber: "",
  interiorNumber: "",
  neighborhood: "",
  city: "",
  state: "",
  postalCode: "",
  references: "",
}

const emptyCart: CartSummary = {
  id: 0,
  item_count: 0,
  total_quantity: 0,
  subtotal: 0,
  iva: 0,
  total_amount: 0,
  restaurant_name: null,
  items: [],
}

export default function UnifiedOrdersPage() {
  const router = useRouter()
  const [role, setRole] = useState<string>("client")
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [cart, setCart] = useState<CartSummary>(emptyCart)
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [roleInitialized, setRoleInitialized] = useState(false)
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  // Estados de Formulario Cliente
  const [addressForm, setAddressForm] = useState<AddressForm>(emptyAddressForm)
  const [isSavingAddress, setIsSavingAddress] = useState(false)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [orderNote, setOrderNote] = useState("")
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)

  useEffect(() => {
    const savedRole = sessionStorage.getItem("userRole") || "client"
    const savedId = sessionStorage.getItem("customerId") || "1"
    setRole(savedRole)
    setCustomerId(savedId)
    setRoleInitialized(true)
  }, [])

  const loadData = useCallback(async () => {
    if (!roleInitialized) return
    
    try {
      const endpoints = role === 'repartidor' 
        ? [`/api/orders?deliverymanId=${customerId}`]
        : [
            `/api/orders?customerId=${customerId}`,
            `/api/cart?customerId=${customerId}`,
            `/api/delivery-addresses?customerId=${customerId}`
          ]

      const responses = await Promise.all(endpoints.map(e => fetch(e)))
      const data = await Promise.all(responses.map(r => r.json()))

      if (role === 'repartidor') {
        setOrders(data[0])
      } else {
        setOrders(data[0])
        setCart(data[1] || emptyCart)
        setAddresses(data[2] || [])
        if (data[2]?.length > 0 && !selectedAddressId) {
          setSelectedAddressId(data[2][0].id)
        }
      }
    } catch (e) {
      console.error("Error loading orders data", e)
    } finally {
      setLoading(false)
    }
  }, [role, customerId, roleInitialized])

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, ORDER_REFRESH_MS)
    return () => clearInterval(interval)
  }, [loadData])

  const handleUpdateStatus = async (orderId: number, status: string) => {
    setUpdatingId(orderId)
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, deliverymanId: customerId })
      })
      if (res.ok) loadData()
    } catch (e) {
      console.error(e)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingAddress(true)
    try {
      const res = await fetch("/api/delivery-addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...addressForm, customerId })
      })
      if (res.ok) {
        const newAddr = await res.json()
        setAddresses(prev => [...prev, newAddr])
        setSelectedAddressId(newAddr.id)
        setAddressForm(emptyAddressForm)
        setShowAddressForm(false)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsSavingAddress(false)
    }
  }

  const submitOrder = async () => {
    setIsSubmittingOrder(true)
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          note: orderNote,
          deliveryAddressId: selectedAddressId
        })
      })
      if (res.ok) {
        router.push("/confirmacion")
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsSubmittingOrder(false)
    }
  }

  if (!roleInitialized) return null

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 border-b border-zinc-800 pb-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-orange-500">
              {role === 'repartidor' ? "Gestión de Entregas" : "Mis Pedidos y Carrito"}
            </h1>
            <p className="text-zinc-500 mt-2">
              {role === 'repartidor' ? "Panel de logística y control de repartidores." : "Gestiona tus compras y sigue tus envíos."}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-zinc-600 block uppercase font-mono">Sesión activa como</span>
            <span className="font-bold text-zinc-300">{role.toUpperCase()}</span>
          </div>
        </header>

        {role === 'repartidor' ? (
          <div className="grid gap-6">
            <h2 className="text-2xl font-bold mb-4">Pedidos Disponibles / Asignados</h2>
            {orders.map(order => (
              <div key={order.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl font-bold">#{order.id}</span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      order.status === 'READY' ? 'bg-green-500 text-black' : 'bg-blue-500 text-white'
                    }`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </div>
                  <p className="text-zinc-400 text-sm">Cliente: <span className="text-zinc-100 font-medium">{order.customer_name}</span></p>
                  <p className="text-zinc-400 text-sm">Dirección: <span className="text-zinc-100 font-medium">{order.delivery_address_json?.street || "No especificada"}</span></p>
                </div>
                
                <div className="flex gap-3">
                  {order.status === 'READY' && (
                    <button 
                      onClick={() => handleUpdateStatus(order.id, 'ON_DELIVERY')}
                      disabled={updatingId === order.id}
                      className="bg-orange-600 hover:bg-orange-500 px-6 py-3 rounded-2xl font-bold transition-all"
                    >
                      Tomar Pedido y Salir
                    </button>
                  )}
                  {order.status === 'ON_DELIVERY' && (
                    <button 
                      onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                      disabled={updatingId === order.id}
                      className="bg-green-600 hover:bg-green-500 px-6 py-3 rounded-2xl font-bold transition-all text-white"
                    >
                      Marcar como Entregado
                    </button>
                  )}
                  {order.status === 'DELIVERED' && (
                    <span className="text-green-500 font-bold uppercase text-xs">Entregado con éxito</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Vista de Cliente - Carrito y Direcciones */}
            <div className="lg:col-span-2 space-y-10">
              <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
                <h2 className="text-2xl font-bold mb-6">Tu Carrito</h2>
                {cart.items.length === 0 ? (
                  <div className="text-center py-10 text-zinc-600 border border-dashed border-zinc-800 rounded-2xl">
                    Tu carrito está vacío.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {cart.items.map(item => (
                      <div key={item.id} className="flex justify-between items-center border-b border-zinc-800 pb-4">
                        <div className="flex gap-4">
                          <div className="w-16 h-16 bg-zinc-800 rounded-xl overflow-hidden flex items-center justify-center text-2xl">🍱</div>
                          <div>
                            <h4 className="font-bold">{item.product_name}</h4>
                            <p className="text-xs text-zinc-500">Cantidad: {item.quantity}</p>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-orange-500">${Number(item.subtotal).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-4">
                      <div className="flex flex-col">
                        <span className="text-zinc-500 font-bold uppercase text-xs">Total del Carrito</span>
                        <span className="text-[10px] text-zinc-600 uppercase tracking-widest">{cart.total_quantity} artículos en total</span>
                      </div>
                      <span className="text-3xl font-black text-white">${Number(cart.total_amount).toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </section>

              <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
                <h2 className="text-2xl font-bold mb-6">Historial de Pedidos</h2>
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl flex justify-between items-center">
                      <div>
                        <span className="text-xs text-zinc-600 block">PEDIDO #{order.id}</span>
                        <span className="text-sm font-medium">{new Date(order.created_at).toLocaleDateString()}</span>
                      </div>
                      <span className={`text-xs font-bold uppercase ${order.status === 'COMPLETED' || order.status === 'DELIVERED' ? 'text-green-500' : 'text-orange-500'}`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar de Pago */}
            <aside className="space-y-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 sticky top-8">
                <h2 className="text-xl font-bold mb-6">Checkout</h2>
                <div className="space-y-4 mb-8">
                  <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black text-zinc-600 uppercase block">Dirección de Entrega</span>
                      <button 
                        type="button"
                        onClick={() => setShowAddressForm(!showAddressForm)}
                        className="text-[9px] text-orange-500 uppercase font-bold hover:underline"
                      >
                        {showAddressForm ? 'Cancelar' : '+ Nueva'}
                      </button>
                    </div>

                    {showAddressForm ? (
                      <form onSubmit={handleSaveAddress} className="mt-3 space-y-2">
                        <input 
                          placeholder="Calle"
                          className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded text-xs"
                          value={addressForm.street}
                          onChange={e => setAddressForm({...addressForm, street: e.target.value})}
                          required
                        />
                        <div className="flex gap-2">
                          <input 
                            placeholder="Ext"
                            className="w-1/2 p-2 bg-zinc-900 border border-zinc-800 rounded text-xs"
                            value={addressForm.exteriorNumber}
                            onChange={e => setAddressForm({...addressForm, exteriorNumber: e.target.value})}
                            required
                          />
                          <input 
                            placeholder="CP (5 dig)"
                            className="w-1/2 p-2 bg-zinc-900 border border-zinc-800 rounded text-xs"
                            value={addressForm.postalCode}
                            onChange={e => setAddressForm({...addressForm, postalCode: e.target.value})}
                            required
                            pattern="[0-9]{5}"
                          />
                        </div>
                        <input 
                          placeholder="Colonia"
                          className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded text-xs"
                          value={addressForm.neighborhood}
                          onChange={e => setAddressForm({...addressForm, neighborhood: e.target.value})}
                          required
                        />
                        <div className="flex gap-2">
                          <input 
                            placeholder="Ciudad"
                            className="w-1/2 p-2 bg-zinc-900 border border-zinc-800 rounded text-xs"
                            value={addressForm.city}
                            onChange={e => setAddressForm({...addressForm, city: e.target.value})}
                            required
                          />
                          <input 
                            placeholder="Estado"
                            className="w-1/2 p-2 bg-zinc-900 border border-zinc-800 rounded text-xs"
                            value={addressForm.state}
                            onChange={e => setAddressForm({...addressForm, state: e.target.value})}
                            required
                          />
                        </div>
                        <button 
                          disabled={isSavingAddress}
                          type="submit" 
                          className="w-full py-2 bg-orange-600 text-[10px] font-bold uppercase rounded hover:bg-orange-700 transition-colors"
                        >
                          {isSavingAddress ? 'Guardando...' : 'Guardar y Seleccionar'}
                        </button>
                      </form>
                    ) : (
                      <>
                        {addresses.length > 0 ? (
                          <select 
                            value={selectedAddressId || ""} 
                            onChange={(e) => setSelectedAddressId(Number(e.target.value))}
                            className="w-full bg-transparent text-sm focus:outline-none"
                          >
                            {addresses.map(a => (
                              <option key={a.id} value={a.id} className="bg-zinc-900 text-white">{a.street} #{a.exterior_number}</option>
                            ))}
                          </select>
                        ) : (
                          <p className="text-xs text-zinc-500 italic">No tienes direcciones guardadas.</p>
                        )}
                      </>
                    )}
                  </div>
                  
                  <textarea 
                    placeholder="Nota especial para cocina..."
                    className="w-full p-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-sm focus:border-orange-500 transition-colors"
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                  />
                </div>

                <Button 
                  onClick={submitOrder}
                  disabled={isSubmittingOrder || cart.items.length === 0 || !selectedAddressId}
                  className="w-full bg-orange-600 hover:bg-orange-500 h-16 text-lg font-black tracking-tight"
                >
                  {isSubmittingOrder ? "Confirmando..." : "Confirmar Pedido"}
                </Button>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}
