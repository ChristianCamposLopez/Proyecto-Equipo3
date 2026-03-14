// app/register/page.tsx
'use client';

import { Card } from "@/app/_components/ui/Card";
import { RegisterForm } from "@/app/_components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100 dark:from-zinc-900 dark:to-zinc-800 p-4">
      <Card 
        title="Crear Cuenta" 
        description="Registro de Administrador del Restaurante"
      >
        <div className="mb-8 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-amber-500">
            <span className="text-2xl text-white">📝</span>
          </div>
        </div>

        <RegisterForm />

        <div className="mt-6 text-center text-sm">
          <p className="text-zinc-500 dark:text-zinc-400">
            ¿Ya tienes cuenta?{' '}
            <a href="/login" className="font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400">
              Inicia sesión
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}
