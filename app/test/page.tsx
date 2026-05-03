"use client"

import { useState, useEffect } from "react"
import { Card } from "@/app/_components/ui/Card"
import { Button } from "@/app/_components/ui/Button"
import Link from "next/link"

export default function TestPage() {
  const [stats, setStats] = useState({ products: 0, categories: 0, orders: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch('/api/platos?restaurantId=1'),
          fetch('/api/categorias?restaurantId=1')
        ])
        const prods = await prodRes.json()
        const cats = await catRes.json()
        setStats({
          products: prods.products?.length || 0,
          categories: cats.categories?.length || 0,
          orders: 5 
        })
      } catch (e) {
        console.error("Error cargando stats de prueba", e)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const enterAs = (role: string, path: string) => {
    sessionStorage.setItem("userRole", role)
    sessionStorage.setItem("customerId", "1") 
    window.location.href = path
  }

  const testModules = [
    {
      group: "Experiencia del Cliente (US001, US002, US003, US014)",
      color: "blue",
      items: [
        { 
          name: "Catálogo y Carrito", 
          path: "/menu", 
          role: "client", 
          icon: "🍱", 
          desc: "Filtrado por categorías (US001) y gestión de carrito virtual con persistencia (US002)." 
        },
        { 
          name: "Checkout y Logística", 
          path: "/orders", 
          role: "client", 
          icon: "📍", 
          desc: "Gestión de direcciones (US014), notas especiales (US007) y seguimiento de estados (US011)." 
        },
      ]
    },
    {
      group: "Operaciones y Cocina (US004, US007, US013)",
      color: "orange",
      items: [
        { 
          name: "Monitor de Cocina", 
          path: "/kitchen", 
          role: "chef", 
          icon: "🍳", 
          desc: "Gestión de pedidos en tiempo real (US004) y cambios de estado a 'En Preparación' (US013)." 
        },
      ]
    },
    {
      group: "Administración y Reportes (US006, US010, US015)",
      color: "purple",
      items: [
        { 
          name: "Dashboard de Ventas", 
          path: "/admin/ventas", 
          role: "admin", 
          icon: "📈", 
          desc: "Reportes diarios (US006) y exportación de datos a Excel (US015)." 
        },
        { 
          name: "Control de Inventario", 
          path: "/menu", 
          role: "admin", 
          icon: "📦", 
          desc: "Activar/Desactivar platos (US005.6) y gestión de stock/agotados (US008)." 
        },
      ]
    },
    {
      group: "Logística y Entrega (US010, US012)",
      color: "green",
      items: [
        { 
          name: "Gestión de Reparto", 
          path: "/orders", 
          role: "repartidor", 
          icon: "🛵", 
          desc: "Asignación de repartidores y actualización de entrega en camino (US010, US012)." 
        },
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-zinc-800 pb-8">
          <div>
            <h1 className="text-5xl font-black tracking-tighter mb-2 bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent uppercase">
              Laboratorio de Trazabilidad
            </h1>
            <p className="text-zinc-500 text-lg">Validación técnica de Historias de Usuario (Backlog EQ3).</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
              <span className="block text-xs uppercase text-zinc-500 mb-1">Items Catálogo</span>
              <span className="text-2xl font-mono font-bold text-orange-500">{loading ? '...' : stats.products}</span>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
              <span className="block text-xs uppercase text-zinc-500 mb-1">Categorías</span>
              <span className="text-2xl font-mono font-bold text-blue-500">{loading ? '...' : stats.categories}</span>
            </div>
          </div>
        </header>

        <div className="grid gap-12">
          {testModules.map((group) => (
            <section key={group.group}>
              <div className="flex items-center gap-4 mb-6">
                <div className={`h-8 w-1.5 rounded-full bg-orange-600`}></div>
                <h2 className="text-2xl font-bold tracking-tight">{group.group}</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {group.items.map((item) => (
                  <div key={item.name} className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 hover:border-zinc-700 transition-all group flex flex-col justify-between">
                    <div>
                      <div className="text-4xl mb-6 bg-zinc-950 w-16 h-16 flex items-center justify-center rounded-2xl border border-zinc-800 group-hover:scale-110 transition-transform">
                        {item.icon}
                      </div>
                      <h3 className="text-2xl font-bold mb-3">{item.name}</h3>
                      <p className="text-zinc-500 text-sm mb-8 leading-relaxed">{item.desc}</p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <Button 
                        onClick={() => enterAs(item.role, item.path)}
                        className="bg-orange-600 hover:bg-orange-500 text-white font-black uppercase tracking-widest text-[10px] px-8 py-4 rounded-xl"
                      >
                        Iniciar Prueba ({item.role})
                      </Button>
                      <span className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest">{item.path}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-24 pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-zinc-600 uppercase tracking-widest font-bold">
          <span>Sistema de Gestión Restaurantera • EQ3</span>
          <div className="flex gap-6">
            <span>Next.js 14</span>
            <span>Three-Layer Arch</span>
            <span>Postgres DB</span>
          </div>
        </footer>
      </div>
    </div>
  )
}
