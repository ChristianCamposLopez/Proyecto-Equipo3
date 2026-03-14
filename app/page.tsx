// app/page.tsx
"use client"
import { Card } from "@/app/_components/ui/Card";
import { Button } from "@/app/_components/ui/Button";

/**
 * Root Router Page - "Isla de Navegación"
 * Menú central de navegación para colaboradores
 */
export default function RootMenu() {
  const routes = [
    { name: 'Dashboard de Ventas', path: '/dashboard', icon: '📊' },
    { name: 'Inicio de Sesión', path: '/login', icon: '🔐' },
    { name: 'Registro de Admin', path: '/register', icon: '📝' },
    { name: 'Recuperar Contraseña', path: '/recovery', icon: '🔑' },
    { name: 'Menú de Productos', path: '/menu', icon: '🍱' },
    { name: 'Gestión de Pedidos', path: '/orders', icon: '🛒' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 flex items-center justify-center p-6">
      <Card title="Restaurante EQ3 - Isla de Navegación" description="Explorador de módulos implementados" className="max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {routes.map((route) => (
            <a key={route.path} href={route.path} className="block transition-transform hover:scale-105">
              <div className="h-full p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:shadow-md flex flex-col items-center text-center gap-2">
                <span className="text-3xl">{route.icon}</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{route.name}</span>
                <Button variant="secondary" className="mt-auto py-2 text-sm h-auto">
                  Ir al módulo
                </Button>
              </div>
            </a>
          ))}
        </div>
        
        <div className="mt-10 border-t border-zinc-200 dark:border-zinc-800 pt-6 text-center text-sm text-zinc-500">
          <p>Proyecto estructurado en capas (DAO, Entity, Service, Controller) - Isla de Navegación del Equipo 3</p>
        </div>
      </Card>
    </div>
  );
}
