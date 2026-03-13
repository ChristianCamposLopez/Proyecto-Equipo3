'use client';

// app/register/page.tsx
// Vista de Registro — US010.1: Registro de Administrador
// Diagrama de Secuencia: vista (Next.js) → authCtrl.registrar(AutenticacionDTO)

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [cargando, setCargando] = useState(false);

  /**
   * Paso 1 del diagrama: ingresarDatos(email, pass, nombre)
   * Paso 2: registrar(AutenticacionDTO) → API
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setExito('');

    // Validación del lado del cliente
    if (password !== confirmarPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setCargando(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, nombre }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al registrar usuario');
        return;
      }

      // Paso 13-14 del diagrama: mensajeExito → mostrarConfirmacion
      setExito('¡Registro exitoso! Redirigiendo al login...');
      setTimeout(() => router.push('/login'), 2000);
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
            <span className="text-2xl">📝</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Crear Cuenta
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Registro de Administrador del Restaurante
          </p>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}
        {exito && (
          <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-600 dark:bg-green-900/20 dark:text-green-400">
            {exito}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nombre" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Nombre Completo
            </label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              placeholder="Carlos Admin"
              className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-zinc-900 transition focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
            />
          </div>

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

          <div>
            <label htmlFor="confirmarPassword" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Confirmar Contraseña
            </label>
            <input
              id="confirmarPassword"
              type="password"
              value={confirmarPassword}
              onChange={(e) => setConfirmarPassword(e.target.value)}
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
            {cargando ? 'Registrando...' : 'Crear Cuenta'}
          </button>
        </form>

        {/* Link a Login */}
        <div className="mt-6 text-center text-sm">
          <p className="text-zinc-500 dark:text-zinc-400">
            ¿Ya tienes cuenta?{' '}
            <a href="/login" className="font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400">
              Inicia sesión
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
