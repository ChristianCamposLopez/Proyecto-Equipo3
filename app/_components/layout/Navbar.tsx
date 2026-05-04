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

  if (pathname === '/login') return null;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
      isScrolled ? "bg-[#161412] border-[#2A2620] py-4 shadow-xl" : "bg-transparent border-transparent py-6"
    }`}>
      <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 border border-[#C17A3A] flex items-center justify-center text-[#C17A3A] text-xl transition-all group-hover:bg-[#C17A3A] group-hover:text-[#111010]">
            🍱
          </div>
          <span className="font-serif font-bold text-2xl tracking-tight text-[#F2EDE4]">
            Restaurante<span className="text-[#C17A3A] italic font-normal">EQ3</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.filter(link => link.roles.includes("all") || link.roles.includes(role || "")).map(link => (
            <Link 
              key={link.path} 
              href={link.path}
              className={`text-xs uppercase tracking-[0.2em] font-medium transition-all ${
                pathname === link.path 
                ? "text-[#C17A3A]" 
                : "text-[#7A7268] hover:text-[#F2EDE4]"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <select 
            value={role || ""} 
            onChange={(e) => switchRole(e.target.value)}
            className="bg-[#1A1714] border border-[#2A2620] text-[#7A7268] text-[10px] uppercase tracking-widest rounded-sm px-3 py-1 outline-none focus:border-[#C17A3A] transition-colors"
          >
            <option value="client">Cliente</option>
            <option value="chef">Chef</option>
            <option value="repartidor">Repartidor</option>
            <option value="admin">Admin</option>
          </select>

          <Link href="/login" className="border border-[#C17A3A] text-[#C17A3A] px-6 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-[#C17A3A] hover:text-[#111010] transition-all">
            Cuenta
          </Link>
        </div>
      </div>
    </nav>
  )
}
