'use client';

// app/dashboard/page.tsx
// Vista del Dashboard — US010.4: Control de Acceso por Roles
// Diagrama de Secuencia: dashboard (Next.js) → authCtrl.verificarPermisos(token)

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface DatosUsuario {
  userId: string;
  email: string;
  rol: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<DatosUsuario | null>(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    /**
     * US010.4 — Verificación de permisos al acceder al módulo
     * Paso 1: intentarAccesoModulo()
     * Paso 2: verificarPermisos(token) → decodificar JWT del lado del cliente
     */
    const verificarAcceso = () => {
      const token = localStorage.getItem('token');

      if (!token) {
        // Sin token → redirigir al login
        router.push('/login');
        return;
      }

      try {
        // Decodificar el payload del JWT (sin verificar firma en cliente)
        const partes = token.split('.');
        if (partes.length !== 3) throw new Error('Token inválido');

        const payload = JSON.parse(atob(partes[1])) as DatosUsuario & { exp: number };

        // Verificar expiración
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }

        setUsuario({
          userId: payload.userId,
          email: payload.email,
          rol: payload.rol,
        });
      } catch {
        // Paso 13-14: errorAccesoDenegado → mostrarMensajeRestriccion
        setError('Sesión inválida. Por favor inicia sesión nuevamente.');
        localStorage.removeItem('token');
        setTimeout(() => router.push('/login'), 2000);
      } finally {
        setCargando(false);
      }
    };

    verificarAcceso();
  }, [router]);

  /**
   * Cerrar sesión — eliminar token y redirigir
   */
  const cerrarSesion = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100 dark:from-zinc-900 dark:to-zinc-800">
        <div className="text-lg text-zinc-600 dark:text-zinc-400">Verificando acceso...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100 dark:from-zinc-900 dark:to-zinc-800">
        <div className="rounded-2xl bg-white p-8 shadow-xl dark:bg-zinc-900">
          <div className="text-center">
            <span className="text-4xl">🚫</span>
            <p className="mt-4 text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Paso 9-10: autorizado → mostrarInterfazEspecifica
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 dark:from-zinc-900 dark:to-zinc-800">
      {/* Barra de navegación */}
      <nav className="border-b border-zinc-200 bg-white/80 px-6 py-4 shadow-sm backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-900/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-amber-500">
              <span className="text-lg">🍽️</span>
            </div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
              Panel de Control
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-zinc-900 dark:text-white">
                {usuario?.email}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Rol: <span className="font-semibold capitalize text-orange-600 dark:text-orange-400">
                  {usuario?.rol}
                </span>
              </p>
            </div>
            <button
              onClick={cerrarSesion}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* Bienvenida */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 p-8 text-white shadow-lg">
          <h2 className="text-2xl font-bold">
            ¡Bienvenido al Sistema de Gestión! 👋
          </h2>
          <p className="mt-2 text-orange-100">
            Gestiona los pedidos de tu restaurante de forma segura y eficiente.
          </p>
        </div>

        {/* Módulos del Dashboard */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Gestión de Pedidos */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <span className="text-xl">📋</span>
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Gestión de Pedidos
            </h3>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Administra y supervisa los pedidos activos del restaurante.
            </p>
          </div>

          {/* Menú */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
              <span className="text-xl">🍔</span>
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Catálogo de Menú
            </h3>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Gestiona productos, categorías y opciones del menú.
            </p>
          </div>

          {/* Pagos */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <span className="text-xl">💳</span>
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Pagos Digitales
            </h3>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Revisa el historial de pagos y transacciones.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
