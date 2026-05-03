"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function ConfirmationPage() {
  const [lastOrder, setLastOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const customerId = sessionStorage.getItem("customerId") || "1"
    fetch(`/api/orders?customerId=${customerId}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) setLastOrder(data[0])
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return null

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-8 font-sans">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-10 text-center shadow-2xl relative overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600"></div>
        
        <div className="mb-8 relative">
          <div className="w-24 h-24 bg-orange-600/10 border border-orange-500/20 rounded-full flex items-center justify-center mx-auto text-5xl">
            ✨
          </div>
          <div className="absolute -bottom-2 right-1/3 animate-bounce">✅</div>
        </div>

        <h1 className="text-4xl font-black tracking-tighter uppercase mb-4">¡Orden Recibida!</h1>
        <p className="text-zinc-500 mb-10 text-sm leading-relaxed">
          Tu pedido ha sido procesado con éxito. Nuestro equipo de cocina ya está manos a la obra.
        </p>

        {lastOrder && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 mb-10 text-left space-y-3">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <span className="text-[10px] font-black text-zinc-600 uppercase">Número de Folio</span>
              <span className="font-mono font-bold text-orange-500">#{lastOrder.id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-zinc-600 uppercase">Monto Total</span>
              <span className="font-bold text-white">${Number(lastOrder.total_amount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-zinc-600 uppercase">Estado Inicial</span>
              <span className="text-xs bg-zinc-800 px-3 py-1 rounded-full text-zinc-300 font-bold uppercase tracking-widest">Confirmado</span>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <Link 
            href="/orders" 
            className="block w-full py-4 bg-orange-600 hover:bg-orange-500 rounded-2xl font-black uppercase tracking-widest transition-all transform active:scale-95 shadow-lg shadow-orange-900/20"
          >
            Rastrear mi Pedido
          </Link>
          <Link 
            href="/menu" 
            className="block w-full py-4 bg-zinc-800 hover:bg-zinc-700 rounded-2xl font-black uppercase tracking-widest transition-all text-zinc-400"
          >
            Volver al Menú
          </Link>
        </div>

        <p className="mt-10 text-[10px] text-zinc-600 uppercase font-bold tracking-widest">
          La Parrilla Mixteca • EQ3 Ecosystem
        </p>
      </div>
    </div>
  )
}
