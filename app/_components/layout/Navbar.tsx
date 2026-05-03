"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function Navbar() {
  const pathname = usePathname()
  const [role, setRole] = useState<string | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    // Detectar rol de sessionStorage (simulación de auth actual)
    const storedRole = sessionStorage.getItem("userRole") || "client"
    setRole(storedRole)

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { name: "Inicio", path: "/", icon: "🏠", roles: ["all"] },
    { name: "Modo Test", path: "/test", icon: "🧪", roles: ["all"] },
    { name: "Menú", path: "/menu", icon: "🍱", roles: ["client", "admin", "restaurant_admin", "chef"] },
    { name: "Mis Pedidos", path: "/orders", icon: "🛒", roles: ["client"] },
    { name: "Entregas", path: "/orders", icon: "🛵", roles: ["repartidor"] },
    { name: "Cocina", path: "/kitchen", icon: "👨‍🍳", roles: ["chef", "admin", "restaurant_admin"] },
    { name: "Ventas", path: "/admin/ventas", icon: "📊", roles: ["admin", "restaurant_admin"] },
  ]

  const switchRole = (newRole: string) => {
    sessionStorage.setItem("userRole", newRole)
    setRole(newRole)
    window.location.reload() // Recargar para aplicar cambios en toda la app
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? "bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md shadow-sm py-2" : "bg-transparent py-4"
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg group-hover:rotate-12 transition-transform">
            🍱
          </div>
          <span className="font-bold text-xl tracking-tight text-zinc-900 dark:text-zinc-100">
            Restaurante<span className="text-orange-600">EQ3</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          {navLinks.filter(link => link.roles.includes("all") || link.roles.includes(role || "")).map(link => (
            <Link 
              key={link.path} 
              href={link.path}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                pathname === link.path 
                ? "bg-white dark:bg-zinc-800 text-orange-600 shadow-sm" 
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              <span className="mr-2">{link.icon}</span>
              {link.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <select 
            value={role || ""} 
            onChange={(e) => switchRole(e.target.value)}
            className="bg-zinc-100 dark:bg-zinc-900 border-none text-xs rounded-lg px-2 py-1 outline-none focus:ring-2 ring-orange-500"
          >
            <option value="client">Cliente</option>
            <option value="chef">Chef</option>
            <option value="repartidor">Repartidor</option>
            <option value="admin">Admin</option>
          </select>

          <Link href="/login" className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors shadow-md hover:shadow-lg active:scale-95">
            Mi Cuenta
          </Link>
        </div>
      </div>
    </nav>
  )
}
