import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ChevronLeft } from '@/components/common/icons';
import { useAppStore } from '@/store/useAppStore';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import type {
  CleaningLevel,
  LifestylePreference,
  NoiseLevel,
  PartyFrequency,
  UserRole,
  VisitsFrequency,
} from '@/types';

export function ProfileEditPage() {
  const navigate = useNavigate();
  const me = useCurrentUser()!;
  const updateCurrentUser = useAppStore((s) => s.updateCurrentUser);

  const [f, setF] = useState({ ...me });
  const [p, setP] = useState({ ...me.preferences });

  function save() {
    updateCurrentUser({ ...f, preferences: p });
    navigate('/profile');
  }

  return (
    <AppLayout hideNav hideHeader>
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-100 px-2 h-14 flex items-center gap-2">
        <button onClick={() => navigate('/profile')} className="p-2 text-gray-500">
          <ChevronLeft width={22} height={22} />
        </button>
        <h1 className="text-lg font-bold text-gray-900 flex-1">Editar perfil</h1>
        <button onClick={save} className="text-brand-500 font-semibold px-3">
          Guardar
        </button>
      </header>

      <div className="p-4 space-y-5 pb-10">
        <Section title="Datos básicos">
          <Field label="Nombre">
            <input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Edad">
              <input
                type="number"
                className="input"
                value={f.age}
                onChange={(e) => setF({ ...f, age: Number(e.target.value) })}
              />
            </Field>
            <Field label="Ciudad">
              <input className="input" value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} />
            </Field>
          </div>
          <Field label="Foto (URL)">
            <input
              className="input"
              value={f.photoUrl}
              placeholder="https://…"
              onChange={(e) => setF({ ...f, photoUrl: e.target.value })}
            />
          </Field>
          <Field label="Profesión">
            <input
              className="input"
              value={f.profession}
              onChange={(e) => setF({ ...f, profession: e.target.value })}
            />
          </Field>
          <Field label="Descripción corta">
            <textarea
              className="input min-h-[80px]"
              value={f.bio}
              onChange={(e) => setF({ ...f, bio: e.target.value })}
            />
          </Field>
        </Section>

        <Section title="Objetivo y condiciones">
          <Field label="¿Qué buscas?">
            <select
              className="input"
              value={f.role}
              onChange={(e) => setF({ ...f, role: e.target.value as UserRole })}
            >
              <option value="seeker_room">Busco habitación</option>
              <option value="seeker_roommate">Busco compañero</option>
              <option value="owner">Alquilo habitación/piso</option>
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={f.role === 'owner' ? 'Precio (€/mes)' : 'Presupuesto (€/mes)'}>
              <input
                type="number"
                className="input"
                value={f.budget}
                onChange={(e) => setF({ ...f, budget: Number(e.target.value) })}
              />
            </Field>
            <Field label={f.role === 'owner' ? 'Disponible desde' : 'Fecha de entrada'}>
              <input
                type="date"
                className="input"
                value={f.moveInDate}
                onChange={(e) => setF({ ...f, moveInDate: e.target.value })}
              />
            </Field>
          </div>
        </Section>

        <Section title="Preferencias de convivencia">
          <Toggle label="Fumador/a" value={p.smoking} onChange={(v) => setP({ ...p, smoking: v })} />
          <Toggle label="Tengo mascotas" value={p.pets} onChange={(v) => setP({ ...p, pets: v })} />
          <Toggle label="Teletrabajo" value={p.remoteWork} onChange={(v) => setP({ ...p, remoteWork: v })} />
          <Select
            label="Limpieza"
            value={p.cleaningLevel}
            options={['baja', 'media', 'alta']}
            onChange={(v) => setP({ ...p, cleaningLevel: v as CleaningLevel })}
          />
          <Select
            label="Ruido"
            value={p.noiseLevel}
            options={['bajo', 'medio', 'alto']}
            onChange={(v) => setP({ ...p, noiseLevel: v as NoiseLevel })}
          />
          <Select
            label="Visitas"
            value={p.visitsFrequency}
            options={['pocas', 'medias', 'frecuentes']}
            onChange={(v) => setP({ ...p, visitsFrequency: v as VisitsFrequency })}
          />
          <Select
            label="Fiestas"
            value={p.partyFrequency}
            options={['nunca', 'a veces', 'frecuente']}
            onChange={(v) => setP({ ...p, partyFrequency: v as PartyFrequency })}
          />
          <Select
            label="Preferencia de convivencia"
            value={p.lifestylePreference}
            options={['tranquila', 'social', 'mixta']}
            onChange={(v) => setP({ ...p, lifestylePreference: v as LifestylePreference })}
          />
        </Section>

        <button onClick={save} className="btn-primary w-full">
          Guardar cambios
        </button>
      </div>
    </AppLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-4 space-y-3">
      <h3 className="font-semibold text-gray-900">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="w-full flex items-center justify-between py-1"
    >
      <span className="text-sm text-gray-700">{label}</span>
      <span
        className={`w-11 h-6 rounded-full p-0.5 transition ${value ? 'bg-brand-500' : 'bg-gray-200'}`}
      >
        <span
          className={`block w-5 h-5 rounded-full bg-white transition ${value ? 'translate-x-5' : ''}`}
        />
      </span>
    </button>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <Field label={label}>
      <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </Field>
  );
}
