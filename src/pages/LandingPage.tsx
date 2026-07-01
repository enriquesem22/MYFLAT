import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { HeartIcon, ShieldIcon, EuroIcon, WrenchIcon } from '@/components/common/icons';

const FEATURES = [
  { icon: <HeartIcon width={20} height={20} />, title: 'Haz match', text: 'Desliza como en tus apps favoritas.' },
  { icon: <ShieldIcon width={20} height={20} />, title: 'Con confianza', text: 'Perfiles verificados y reputación real.' },
  { icon: <EuroIcon width={20} height={20} />, title: 'Pagos claros', text: 'Organiza el alquiler sin líos.' },
  { icon: <WrenchIcon width={20} height={20} />, title: 'Incidencias', text: 'Reporta problemas del piso al instante.' },
];

export function LandingPage() {
  const navigate = useNavigate();
  const login = useAppStore((s) => s.login);

  function enterDemo() {
    // Acceso rápido con la cuenta demo.
    if (login('demo@myflat.app')) navigate('/discover');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-500 to-brand-700 text-white flex flex-col">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col px-6 py-10">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-extrabold">
            M
          </div>
          <span className="text-xl font-extrabold tracking-tight">Myflat</span>
        </div>

        <div className="flex-1 flex flex-col justify-center py-10">
          <h1 className="text-4xl font-extrabold leading-tight">
            Encuentra habitación, compañero o inquilino con confianza.
          </h1>
          <p className="mt-4 text-white/80 text-lg">
            Perfiles verificados, reputación real, pagos organizados e incidencias
            gestionadas desde una sola app.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white/10 rounded-2xl p-4 backdrop-blur">
                <div className="text-white mb-2">{f.icon}</div>
                <div className="font-semibold">{f.title}</div>
                <div className="text-sm text-white/70">{f.text}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Link to="/register" className="btn w-full bg-white text-brand-600 hover:bg-white/90">
            Crear cuenta
          </Link>
          <Link
            to="/login"
            className="btn w-full bg-transparent border border-white/40 text-white hover:bg-white/10"
          >
            Ya tengo cuenta
          </Link>
          <button
            onClick={enterDemo}
            className="w-full text-center text-sm text-white/80 underline underline-offset-4 py-1"
          >
            Explorar con cuenta demo →
          </button>
        </div>
      </div>
    </div>
  );
}
