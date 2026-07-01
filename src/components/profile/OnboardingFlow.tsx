import { useState } from 'react';
import type { User, UserRole } from '@/types';
import { BuildingIcon, HeartIcon, UserIcon } from '@/components/common/icons';

interface Props {
  initialName?: string;
  onComplete: (data: Partial<User>) => void;
}

const ROLES: { value: UserRole; title: string; desc: string; icon: React.ReactNode }[] = [
  {
    value: 'seeker_room',
    title: 'Busco habitación',
    desc: 'Encuentra tu próxima habitación o piso.',
    icon: <HeartIcon width={24} height={24} />,
  },
  {
    value: 'seeker_roommate',
    title: 'Busco compañero',
    desc: 'Comparte piso con la persona ideal.',
    icon: <UserIcon width={24} height={24} />,
  },
  {
    value: 'owner',
    title: 'Alquilo habitación/piso',
    desc: 'Publica y encuentra buenos inquilinos.',
    icon: <BuildingIcon width={24} height={24} />,
  },
];

// Onboarding corto en 2 pasos: (1) objetivo, (2) datos básicos.
export function OnboardingFlow({ initialName = '', onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<UserRole | null>(null);
  const [form, setForm] = useState({
    name: initialName,
    age: '25',
    city: 'Barcelona',
    phone: '',
    budget: '600',
    moveInDate: new Date().toISOString().slice(0, 10),
  });

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function finish() {
    if (!role) return;
    onComplete({
      role,
      name: form.name.trim(),
      age: Number(form.age) || 25,
      city: form.city.trim(),
      budget: Number(form.budget) || 0,
      moveInDate: form.moveInDate,
    });
  }

  return (
    <div className="max-w-md mx-auto px-6 py-8">
      {/* Progreso */}
      <div className="flex gap-2 mb-8">
        {[0, 1].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full ${s <= step ? 'bg-brand-500' : 'bg-gray-200'}`}
          />
        ))}
      </div>

      {step === 0 && (
        <div>
          <h1 className="text-2xl font-bold text-gray-900">¿Qué quieres hacer en Myflat?</h1>
          <p className="text-gray-500 mt-1">Elige para personalizar tu experiencia.</p>

          <div className="mt-6 space-y-3">
            {ROLES.map((r) => (
              <button
                key={r.value}
                onClick={() => setRole(r.value)}
                className={`w-full text-left flex items-center gap-4 p-4 rounded-2xl border-2 transition ${
                  role === r.value
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    role === r.value ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {r.icon}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{r.title}</div>
                  <div className="text-sm text-gray-500">{r.desc}</div>
                </div>
              </button>
            ))}
          </div>

          <button
            className="btn-primary w-full mt-8"
            disabled={!role}
            onClick={() => setStep(1)}
          >
            Continuar
          </button>
        </div>
      )}

      {step === 1 && (
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cuéntanos lo básico</h1>
          <p className="text-gray-500 mt-1">Podrás completar tu perfil poco a poco.</p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="label">Nombre</label>
              <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Edad</label>
                <input
                  type="number"
                  className="input"
                  value={form.age}
                  onChange={(e) => set('age', e.target.value)}
                />
              </div>
              <div>
                <label className="label">Ciudad</label>
                <input className="input" value={form.city} onChange={(e) => set('city', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label">Teléfono (opcional)</label>
              <input className="input" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">
                  {role === 'owner' ? 'Precio (€/mes)' : 'Presupuesto (€/mes)'}
                </label>
                <input
                  type="number"
                  className="input"
                  value={form.budget}
                  onChange={(e) => set('budget', e.target.value)}
                />
              </div>
              <div>
                <label className="label">
                  {role === 'owner' ? 'Disponible desde' : 'Fecha de entrada'}
                </label>
                <input
                  type="date"
                  className="input"
                  value={form.moveInDate}
                  onChange={(e) => set('moveInDate', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button className="btn-secondary flex-1" onClick={() => setStep(0)}>
              Atrás
            </button>
            <button className="btn-primary flex-1" onClick={finish} disabled={!form.name.trim()}>
              Empezar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
