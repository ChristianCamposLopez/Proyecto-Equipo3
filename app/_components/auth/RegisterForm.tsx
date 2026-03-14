// components/auth/RegisterForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/_components/ui/Button';
import { Input } from '@/app/_components/ui/Input';

export const RegisterForm = () => {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setExito('');

    if (password !== confirmarPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

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

      setExito('¡Registro exitoso! Redirigiendo...');
      setTimeout(() => router.push('/login'), 2000);
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">{error}</div>}
      {exito && <div className="rounded-lg bg-green-50 p-3 text-sm text-green-600 dark:bg-green-900/20 dark:text-green-400">{exito}</div>}
      
      <Input label="Nombre Completo" id="nombre" type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
      <Input label="Correo Electrónico" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <Input label="Contraseña" id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <Input label="Confirmar Contraseña" id="confirmarPassword" type="password" value={confirmarPassword} onChange={(e) => setConfirmarPassword(e.target.value)} required />

      <Button type="submit" loading={loading}>
        Crear Cuenta
      </Button>
    </form>
  );
};
