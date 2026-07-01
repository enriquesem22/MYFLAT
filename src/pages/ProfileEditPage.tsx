import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Avatar } from '@/components/common/Avatar';
import {
  CameraIcon,
  ChevronLeft,
  InstagramIcon,
  LinkedinIcon,
} from '@/components/common/icons';
import { useAppStore } from '@/store/useAppStore';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { uploadImageFile } from '@/lib/storage';
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
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  async function onPickPhoto(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setPhotoError('');
    setPhotoUploading(true);
    try {
      const url = await uploadImageFile(file, 'avatars');
      setF((prev) => ({ ...prev, photoUrl: url }));
    } catch (e) {
      setPhotoError(
        e instanceof Error
          ? e.message
          : 'No se pudo subir la foto. Revisa los permisos e inténtalo de nuevo.',
      );
    } finally {
      setPhotoUploading(false);
    }
  }

  function save() {
    // Mantener sincronizados los indicadores de "conectado" con los enlaces.
    updateCurrentUser({
      ...f,
      preferences: p,
      instagramConnected: Boolean(f.instagramUrl?.trim()),
      linkedinConnected: Boolean(f.linkedinUrl?.trim()),
    });
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
          <Field label="Foto de perfil">
            <div className="flex items-center gap-4">
              <Avatar name={f.name} photoUrl={f.photoUrl} size={72} />
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn-secondary flex-1 text-xs"
                    onClick={() => galleryRef.current?.click()}
                    disabled={photoUploading}
                  >
                    Elegir de galería
                  </button>
                  <button
                    type="button"
                    className="btn-secondary flex-1 text-xs"
                    onClick={() => cameraRef.current?.click()}
                    disabled={photoUploading}
                  >
                    <CameraIcon width={15} height={15} /> Hacer foto
                  </button>
                </div>
                {photoUploading && <p className="text-xs text-brand-600">Subiendo foto…</p>}
                {photoError && <p className="text-xs text-red-500">{photoError}</p>}
                {f.photoUrl && !photoUploading && (
                  <button
                    type="button"
                    className="text-xs text-red-500"
                    onClick={() => setF({ ...f, photoUrl: '' })}
                  >
                    Quitar foto
                  </button>
                )}
              </div>
            </div>
            {/* Galería: sin capture. Cámara: capture="user" (frontal). */}
            <input
              ref={galleryRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                onPickPhoto(e.target.files);
                e.target.value = '';
              }}
            />
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={(e) => {
                onPickPhoto(e.target.files);
                e.target.value = '';
              }}
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

        <Section title="Redes sociales">
          <p className="text-xs text-gray-400 -mt-1">
            Aumentan la confianza. Antes de hacer match solo se ve que están conectadas; el
            enlace completo se muestra tras el match.
          </p>
          <Field label="Instagram (enlace)">
            <div className="flex items-center gap-2">
              <InstagramIcon width={18} height={18} className="text-gray-400 shrink-0" />
              <input
                className="input"
                value={f.instagramUrl ?? ''}
                placeholder="https://instagram.com/tu_usuario"
                onChange={(e) => setF({ ...f, instagramUrl: e.target.value })}
              />
            </div>
          </Field>
          <Field label="LinkedIn (enlace)">
            <div className="flex items-center gap-2">
              <LinkedinIcon width={18} height={18} className="text-gray-400 shrink-0" />
              <input
                className="input"
                value={f.linkedinUrl ?? ''}
                placeholder="https://linkedin.com/in/tu_usuario"
                onChange={(e) => setF({ ...f, linkedinUrl: e.target.value })}
              />
            </div>
          </Field>
          <Toggle
            label="Mostrar fotos de Instagram en mi perfil"
            value={Boolean(f.instagramShowPhotos)}
            onChange={(v) => setF({ ...f, instagramShowPhotos: v })}
          />
          <p className="text-[11px] text-gray-400">
            La previsualización de fotos de Instagram requiere su API oficial y aún no está
            disponible en esta versión. De momento se mostrará el enlace.
          </p>
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
