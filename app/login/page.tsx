'use client';

// app/login/page.tsx
// Vista de Login — US010.2: Inicio de Sesión
// Diagrama de Secuencia: loginPage (Next.js) → authCtrl.login(AutenticacionDTO)

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  /**
   * Paso 1 del diagrama: ingresarCredenciales(email, pass)
   * Paso 2: login(AutenticacionDTO) → API
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Paso 13/15: mostrarNotificacionError
        setError(data.error || 'Error al iniciar sesión');
        return;
      }

      // Paso 10-11: token JWT → redirigirPanelControl
      localStorage.setItem('token', data.token);
      router.push('/dashboard');
    } catch {
      setError('Error de conexión con el servidor');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100 dark:from-zinc-900 dark:to-zinc-800">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl dark:bg-zinc-900">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-amber-500">
            <span className="text-2xl">🔐</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Iniciar Sesión
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Panel de Administración del Restaurante
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@restaurante.com"
              className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-zinc-900 transition focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-zinc-900 transition focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 py-3 font-semibold text-white shadow-lg transition hover:from-orange-600 hover:to-amber-600 disabled:opacity-50"
          >
            {cargando ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Links */}
        <div className="mt-6 space-y-2 text-center text-sm">
          <a
            href="/recovery"
            className="block text-orange-600 transition hover:text-orange-700 dark:text-orange-400"
          >
            ¿Olvidaste tu contraseña?
          </a>
          <p className="text-zinc-500 dark:text-zinc-400">
            ¿No tienes cuenta?{' '}
            <a href="/register" className="font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400">
              Regístrate aquí
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
