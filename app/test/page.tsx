"use client"

import { useState, useEffect } from "react"
import { Card } from "@/app/_components/ui/Card"
import { Button } from "@/app/_components/ui/Button"

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
      group: "Experiencia del Cliente (US001-US003, US014, US021)",
      color: "blue",
      items: [
        { 
          name: "Catálogo y Carrito", 
          path: "/menu", 
          role: "client", 
          icon: "🍱", 
          desc: "Filtrado por categorías (US001) y carrito virtual con persistencia (US002)." 
        },
        { 
          name: "Checkout y Logística", 
          path: "/orders", 
          role: "client", 
          icon: "📍", 
          desc: "Direcciones (US014), notas (US007) y seguimiento de estados (US011)." 
        },
      ]
    },
    {
      group: "Operaciones y Cocina (US004, US013)",
      color: "orange",
      items: [
        { 
          name: "Monitor de Cocina", 
          path: "/kitchen", 
          role: "chef", 
          icon: "🍳", 
          desc: "Dashboard real-time (US004) y gestión de estados de preparación (US013)." 
        },
      ]
    },
    {
      group: "Administración Estratégica (US006, US010, US015, US019)",
      color: "purple",
      items: [
        { 
          name: "Reportes Financieros", 
          path: "/admin/ventas", 
          role: "admin", 
          icon: "📈", 
          desc: "Ventas diarias (US006) y exportación a Excel (US015)." 
        },
        { 
          name: "Ranking de Ventas", 
          path: "/admin/ranking", 
          role: "admin", 
          icon: "🏆", 
          desc: "Cálculo de platos más vendidos (US019.1) para toma de decisiones." 
        },
      ]
    },
    {
      group: "Gestión Operativa (US005, US008, US025, US026)",
      color: "emerald",
      items: [
        { 
          name: "Gestión de Menú", 
          path: "/menu", 
          role: "admin", 
          icon: "📦", 
          desc: "Disponibilidad (US005.6, US008) y Toggle de stock/agotados." 
        },
        { 
          name: "Perfil Restaurante", 
          path: "/admin/restaurante", 
          role: "admin", 
          icon: "🏪", 
          desc: "Gestión de RFC, Horarios y Datos de contacto (US025.x)." 
        },
        { 
          name: "Reembolsos", 
          path: "/admin/reembolsos", 
          role: "admin", 
          icon: "💸", 
          desc: "Flujo de aprobación y estados financieros de reembolsos (US026)." 
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
          desc: "Asignación de repartidores y control de última milla (US010, US012)." 
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
              Laboratorio Full-Traceability
            </h1>
            <p className="text-zinc-500 text-lg">Validación técnica de Historias de Usuario (Sprint 4 - EQ3).</p>
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
                <h2 className="text-2xl font-bold tracking-tight uppercase italic">{group.group}</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {group.items.map((item) => (
                  <div key={item.name} className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 hover:border-zinc-700 transition-all group flex flex-col justify-between shadow-lg hover:shadow-orange-900/10">
                    <div>
                      <div className="text-4xl mb-6 bg-zinc-950 w-16 h-16 flex items-center justify-center rounded-2xl border border-zinc-800 group-hover:scale-110 transition-transform">
                        {item.icon}
                      </div>
                      <h3 className="text-xl font-bold mb-3">{item.name}</h3>
                      <p className="text-zinc-500 text-xs mb-8 leading-relaxed line-clamp-3">{item.desc}</p>
                    </div>
                    
                    <div className="flex flex-col gap-4 mt-auto">
                      <Button 
                        onClick={() => enterAs(item.role, item.path)}
                        className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black uppercase tracking-widest text-[9px] py-4 rounded-xl shadow-xl shadow-orange-900/20"
                      >
                        Probar Historia ({item.role})
                      </Button>
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[9px] font-mono text-zinc-700 uppercase tracking-widest">{item.path}</span>
                        <span className="text-[9px] font-black text-orange-900 uppercase">Audit Ready</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-24 pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-zinc-600 uppercase tracking-widest font-bold">
          <span>Sistema de Gestión Restaurantera • EQ3 • Sprint 4</span>
          <div className="flex gap-6">
            <span>Next.js 14</span>
            <span>Three-Layer Architecture</span>
            <span>Dockerized Environment</span>
          </div>
        </footer>
      </div>
    </div>
  )
}
