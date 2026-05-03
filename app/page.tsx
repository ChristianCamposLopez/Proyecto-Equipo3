"use client"

import { useState, useEffect } from "react"
import { Card } from "@/app/_components/ui/Card"
import { Button } from "@/app/_components/ui/Button"
import Link from "next/link"

export default function RootMenu() {
  const [role, setRole] = useState<string>("client")

  useEffect(() => {
    setRole(sessionStorage.getItem("userRole") || "client")
  }, [])

  const modules = [
    { 
      title: "Módulos de Cliente", 
      icon: "👤",
      role: "client",
      items: [
        { name: "Ver Menú", path: "/menu", icon: "🍱", desc: "Explora y agrega platillos a tu carrito." },
        { name: "Mis Pedidos", path: "/orders", icon: "🛒", desc: "Sigue el estado de tus órdenes en tiempo real." },
        { name: "Perfil", path: "/login", icon: "⚙️", desc: "Gestiona tu cuenta y direcciones." },
      ]
    },
    { 
      title: "Módulos de Operación", 
      icon: "🍳",
      role: "chef",
      items: [
        { name: "Gestión de Cocina", path: "/kitchen", icon: "👨‍🍳", desc: "Controla pedidos entrantes y estados de preparación." },
        { name: "Disponibilidad", path: "/menu", icon: "📋", desc: "Activa o desactiva productos del catálogo." },
      ]
    },
    { 
      title: "Módulos de Administración", 
      icon: "🏛️",
      role: "admin",
      items: [
        { name: "Dashboard de Ventas", path: "/admin/ventas", icon: "📈", desc: "Reportes, KPIs y exportación de datos financieros." },
        { name: "Control de Inventario", path: "/menu", icon: "📦", desc: "Gestión global de productos y stock." },
        { name: "Seguridad", path: "/register", icon: "🛡️", desc: "Registro de nuevos administradores y roles." },
      ]
    },
    { 
      title: "Logística", 
      icon: "🛵",
      role: "repartidor",
      items: [
        { name: "Pedidos Asignados", path: "/orders", icon: "📦", desc: "Gestión de entregas y cambio de estados." },
      ]
    }
  ]

  return (
    <div className="min-h-[calc(100vh-80px)] bg-zinc-50 dark:bg-zinc-950 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 text-center md:text-left">
          <h1 className="text-4xl font-bold font-serif text-zinc-900 dark:text-zinc-100 mb-2">
            Isla de Navegación <span className="text-orange-600">EQ3</span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Centro de mando unificado para la gestión integral del restaurante. 
            Estás navegando como: <span className="font-bold text-orange-600 uppercase">{role}</span>
          </p>
        </header>

        <div className="space-y-12">
          {modules.map((section) => (
            <section key={section.title} className={role !== 'admin' && section.role !== role ? 'opacity-40 grayscale pointer-events-none' : ''}>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl bg-white dark:bg-zinc-900 w-10 h-10 flex items-center justify-center rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
                  {section.icon}
                </span>
                <h2 className="text-2xl font-bold font-serif">{section.title}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.items.map((item) => (
                  <Link key={item.path} href={item.path} className="group">
                    <Card className="h-full hover:border-orange-500 transition-colors cursor-pointer group-hover:shadow-lg">
                      <div className="flex items-start gap-4">
                        <div className="text-3xl p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl group-hover:scale-110 transition-transform">
                          {item.icon}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg mb-1 group-hover:text-orange-600 transition-colors">{item.name}</h3>
                          <p className="text-sm text-zinc-500 line-clamp-2">{item.desc}</p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-20 border-t border-zinc-200 dark:border-zinc-800 pt-8 text-center text-xs text-zinc-400 uppercase tracking-widest">
          Sistema Restaurante • Proyecto Equipo 3 • Arquitectura Multicapa
        </footer>
      </div>
    </div>
  )
}
