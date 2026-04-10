// app/login/page.tsx
'use client';

import { Card } from "@/app/_components/ui/Card";
import { LoginForm } from "@/app/_components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100 dark:from-zinc-900 dark:to-zinc-800 p-4">
      <Card 
        title="Iniciar Sesión" 
        description="Panel de Administración del Restaurante"
      >
        <div className="mb-8 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-amber-500">
            <span className="text-2xl text-white">🔐</span>
          </div>
        </div>

        <LoginForm />

        <div className="mt-6 space-y-2 text-center text-sm">
          <a href="/recovery" className="block text-orange-600 transition hover:text-orange-700 dark:text-orange-400">
            ¿Olvidaste tu contraseña?
          </a>
          <p className="text-zinc-500 dark:text-zinc-400">
            ¿No tienes cuenta?{' '}
            <a href="/register" className="font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400">
              Regístrate aquí
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}
