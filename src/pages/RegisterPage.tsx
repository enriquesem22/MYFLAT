import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';

export function RegisterPage() {
  const navigate = useNavigate();
  const register = useAppStore((s) => s.register);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    register({ name: name.trim(), email: email.trim() });
    navigate('/onboarding');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center px-6 py-10">
        <Link to="/" className="text-brand-500 font-extrabold text-2xl mb-8">
          Myflat
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Crea tu cuenta</h1>
        <p className="text-gray-500 mt-1">Solo necesitas email para empezar.</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="label">Nombre</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              required
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tucorreo@email.com"
              required
            />
          </div>
          <div>
            <label className="label">Contraseña</label>
            <input type="password" className="input" placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn-primary w-full">
            Continuar
          </button>
        </form>

        <p className="mt-4 text-xs text-gray-400 text-center">
          Al continuar aceptas nuestras condiciones y política de privacidad. No
          guardamos datos sensibles en esta versión de prueba.
        </p>

        <p className="mt-6 text-center text-sm text-gray-500">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-brand-500 font-semibold">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
