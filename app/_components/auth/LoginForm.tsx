// components/auth/LoginForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/_components/ui/Button';
import { Input } from '@/app/_components/ui/Input';

export const LoginForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Error al iniciar sesión');
        return;
      }

      // 1. Guardamos el token y datos de sesión
      localStorage.setItem('token', data.token);
      sessionStorage.setItem('userId', data.userId);
      sessionStorage.setItem('customerId', data.userId); // Sincronizado para componentes
      sessionStorage.setItem('userRole', data.rol);

      // Redirección centralizada a la Isla de Navegación
      router.push('/');
    } catch {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: loginStyles }} />
      <div className="login-box">
        <div className="login-header">
          <div className="login-label">Autenticación</div>
          <h1 className="login-title">Ingreso al <em>Sistema</em></h1>
          <p className="login-subtitle">
            Proporcione sus credenciales para acceder al centro de mando unificado.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="login-error">
              {error}
            </div>
          )}
          
          <div className="input-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@restaurante.com"
              className="login-input"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="login-input"
            />
          </div>

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? 'VERIFICANDO...' : 'INICIAR SESIÓN'}
          </button>
        </form>

        <div className="login-footer">
          <span>Seguridad de Grado Empresarial</span>
          <span>© 2026 Restaurante EQ3</span>
        </div>
      </div>
    </>
  );
};

const loginStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500;700&display=swap');

  .login-box {
    width: 100%;
    max-width: 440px;
    margin: 0 auto;
    padding: 48px;
    background: #161412;
    border: 1px solid #2A2620;
    border-radius: 2px;
    animation: fadeIn 0.8s ease both;
  }

  .login-header {
    margin-bottom: 40px;
    text-align: left;
  }

  .login-label {
    font-size: 10px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: #C17A3A;
    margin-bottom: 12px;
  }

  .login-title {
    font-family: 'Playfair Display', serif;
    font-size: 32px;
    font-weight: 700;
    line-height: 1.2;
    color: #F2EDE4;
  }

  .login-title em {
    font-style: italic;
    font-weight: 400;
    color: #C17A3A;
  }

  .login-subtitle {
    margin-top: 12px;
    font-size: 13px;
    color: #7A7268;
    line-height: 1.6;
    font-weight: 300;
  }

  .login-form {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .login-error {
    padding: 12px;
    background: rgba(179, 74, 74, 0.1);
    border: 1px solid #B34A4A;
    color: #B34A4A;
    font-size: 12px;
    border-radius: 2px;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .input-group label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #7A7268;
  }

  .login-input {
    background: #111010;
    border: 1px solid #2A2620;
    padding: 14px 16px;
    color: #F2EDE4;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    border-radius: 2px;
    transition: border-color 0.3s;
  }

  .login-input:focus {
    outline: none;
    border-color: #C17A3A;
  }

  .login-btn {
    margin-top: 12px;
    background: #C17A3A;
    border: none;
    color: #111010;
    padding: 16px;
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.15em;
    cursor: pointer;
    transition: background 0.3s;
    border-radius: 2px;
  }

  .login-btn:hover {
    background: #D68F4A;
  }

  .login-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .login-footer {
    margin-top: 40px;
    padding-top: 24px;
    border-top: 1px solid #2A2620;
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    color: #3A3630;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;
