"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function DashboardRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/admin/ventas")
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-zinc-500 animate-pulse">Redirigiendo al Dashboard de Ventas...</p>
    </div>
  )
}
