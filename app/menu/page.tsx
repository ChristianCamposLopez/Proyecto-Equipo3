"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import { ProductoEntity, CategoriaEntity, CartSummary } from "@/models/entities"

const RESTAURANT_ID = 1

export default function MenuPage() {
  const router = useRouter()
  const [role, setRole] = useState<string>("client")
  const [userId, setUserId] = useState<string | null>(null)
  const [categories, setCategories] = useState<CategoriaEntity[]>([])
  const [products, setProducts] = useState<ProductoEntity[]>([])
  const [activeCategory, setActiveCategory] = useState<number | null>(null)
  const [cart, setCart] = useState<CartSummary>(() => ({ ...({} as CartSummary), total_amount: 0, items: [] }))
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  useEffect(() => {
    const savedRole = sessionStorage.getItem("userRole") || "client"
    const savedId = sessionStorage.getItem("customerId") || "1"
    setRole(savedRole)
    setUserId(savedId)
    loadBaseData()
  }, [])

  const loadBaseData = async () => {
    try {
      const res = await fetch(`/api/categorias?restaurantId=${RESTAURANT_ID}`)
      const data = await res.json()
      setCategories(data.categories || [])
    } catch (e) {
      console.error(e)
    }
  }

  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      let url = `/api/platos?restaurantId=${RESTAURANT_ID}`
      if (activeCategory) url += `&categoryId=${activeCategory}`
      
      const [prodRes, cartRes] = await Promise.all([
        fetch(url),
        fetch(`/api/cart?customerId=${userId}`)
      ])
      
      const prodData = await prodRes.json()
      const cartData = await cartRes.json()
      
      setProducts(prodData.products || [])
      setCart(cartData || { total_amount: 0, items: [] })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [activeCategory, userId])

  useEffect(() => {
    if (userId) loadProducts()
  }, [loadProducts, userId])

  const addToCart = async (productId: number) => {
    setUpdatingId(productId)
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: userId, productId, quantity: 1 })
      })
      if (res.ok) {
        const data = await res.json()
        setCart(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setUpdatingId(null)
    }
  }

  const toggleAvailability = async (productId: number, currentStatus: boolean) => {
    setUpdatingId(productId)
    try {
      // US010: El admin puede cambiar disponibilidad
      const res = await fetch(`/api/platos/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !currentStatus })
      })
      if (res.ok) loadProducts()
    } catch (e) {
      console.error(e)
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-zinc-800 pb-8">
          <div>
            <h1 className="text-5xl font-black uppercase tracking-tighter text-orange-500">Menú Digital</h1>
            <p className="text-zinc-500 mt-2 italic">La Parrilla Mixteca — Sabores que trascienden.</p>
          </div>
          
          <Link href="/orders" className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl hover:border-orange-500 transition-all group">
            <span className="text-[10px] font-black text-zinc-500 uppercase block mb-1">Carrito de Compras</span>
            <span className="text-3xl font-black text-white group-hover:text-orange-500 transition-colors">
              ${Number(cart.total_amount || 0).toFixed(2)}
            </span>
            <span className="block text-xs text-zinc-600 mt-1">Ver detalles del pedido →</span>
          </Link>
        </header>

        <nav className="flex gap-2 overflow-x-auto pb-6 scrollbar-hide">
          <button 
            onClick={() => setActiveCategory(null)}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${activeCategory === null ? 'bg-orange-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}
          >
            Todos
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${activeCategory === cat.id ? 'bg-orange-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}
            >
              {cat.name}
            </button>
          ))}
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map(product => (
            <div key={product.id} className={`group bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col transition-all hover:border-zinc-700 ${!product.is_available ? 'grayscale opacity-60' : ''}`}>
              <div className="aspect-video bg-zinc-800 relative overflow-hidden">
                {product.image_url ? (
                  <Image src={product.image_url} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-4xl">🥘</div>
                )}
                {!product.is_available && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="bg-red-600 text-white px-4 py-1 rounded-full text-xs font-black uppercase">Agotado</span>
                  </div>
                )}
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-[10px] font-black text-orange-500 uppercase">{product.category_name}</span>
                    <h3 className="text-xl font-bold">{product.name}</h3>
                  </div>
                  <span className="text-xl font-black text-white">${Number(product.base_price).toFixed(2)}</span>
                </div>
                
                <p className="text-sm text-zinc-500 mb-6 line-clamp-2">{product.descripcion || "Sin descripción disponible."}</p>

                <div className="mt-auto space-y-3">
                  {(role === 'admin' || role === 'restaurant_admin' || role === 'chef') ? (
                    <button 
                      onClick={() => toggleAvailability(product.id, !!product.is_available)}
                      disabled={updatingId === product.id}
                      className={`w-full py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${
                        product.is_available ? 'bg-zinc-800 text-zinc-400 hover:bg-red-900 hover:text-white' : 'bg-green-900 text-green-100 hover:bg-green-800'
                      }`}
                    >
                      {product.is_available ? "Desactivar Disponibilidad" : "Activar Disponibilidad"}
                    </button>
                  ) : (
                    <button 
                      onClick={() => addToCart(product.id)}
                      disabled={!product.is_available || updatingId === product.id}
                      className="w-full py-4 bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-800 disabled:text-zinc-600 rounded-2xl font-black transition-all transform active:scale-95"
                    >
                      {updatingId === product.id ? "Agregando..." : product.is_available ? "Agregar al Carrito" : "No Disponible"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}