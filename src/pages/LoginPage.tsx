import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAppStore((s) => s.login);
  const [email, setEmail] = useState('demo@myflat.app');
  const [password, setPassword] = useState('demo1234');
  const [error, setError] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    // En el MVP no se comprueba la contraseña, solo que el email exista.
    if (login(email)) {
      navigate('/discover');
    } else {
      setError('No encontramos ese email. Prueba con demo@myflat.app o crea una cuenta.');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center px-6 py-10">
        <Link to="/" className="text-brand-500 font-extrabold text-2xl mb-8">
          Myflat
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Bienvenido de nuevo</h1>
        <p className="text-gray-500 mt-1">Inicia sesión para continuar.</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
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
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" className="btn-primary w-full">
            Entrar
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-brand-500 font-semibold">
            Crear cuenta
          </Link>
        </p>
        <p className="mt-2 text-center text-xs text-gray-400">
          Cuenta demo: <b>demo@myflat.app</b>
        </p>
      </div>
    </div>
  );
}
