import { useRef, useState } from 'react';
import type { Property } from '@/types';
import { uploadImageFile } from '@/lib/storage';
import { CameraIcon, FileIcon, PlusIcon, XIcon } from '@/components/common/icons';

export interface PropertyDraft {
  title: string;
  city: string;
  neighborhood: string;
  approximateAddress: string;
  price: number;
  deposit: number;
  expensesIncluded: boolean;
  availableFrom: string;
  minStayMonths: number;
  rooms: number;
  bathrooms: number;
  currentRoommates: number;
  description: string;
  photos: string[]; // data URLs
  plans: string[]; // data URLs
  videos: string[]; // enlaces
  ownerLivesHere: boolean;
}

interface Props {
  onSubmit: (draft: PropertyDraft) => void;
  onCancel: () => void;
}

// Formulario para que un propietario publique una habitación/piso.
export function PropertyForm({ onSubmit, onCancel }: Props) {
  const [d, setD] = useState<PropertyDraft>({
    title: '',
    city: 'Barcelona',
    neighborhood: '',
    approximateAddress: '',
    price: 600,
    deposit: 600,
    expensesIncluded: true,
    availableFrom: new Date().toISOString().slice(0, 10),
    minStayMonths: 6,
    rooms: 3,
    bathrooms: 1,
    currentRoommates: 2,
    description: '',
    photos: [],
    plans: [],
    videos: [],
    ownerLivesHere: false,
  });
  const [videoUrl, setVideoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  function set<K extends keyof PropertyDraft>(key: K, value: PropertyDraft[K]) {
    setD((prev) => ({ ...prev, [key]: value }));
  }

  async function addImages(files: FileList | null, key: 'photos' | 'plans') {
    if (!files || files.length === 0) return;
    setError('');
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        urls.push(await uploadImageFile(file, key === 'plans' ? 'plans' : 'properties'));
      }
      setD((prev) => ({ ...prev, [key]: [...prev[key], ...urls] }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron subir las imágenes.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(d);
      }}
      className="space-y-4"
    >
      <div>
        <label className="label">Título</label>
        <input
          className="input"
          value={d.title}
          placeholder="Habitación luminosa en…"
          onChange={(e) => set('title', e.target.value)}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Ciudad</label>
          <input className="input" value={d.city} onChange={(e) => set('city', e.target.value)} />
        </div>
        <div>
          <label className="label">Barrio</label>
          <input
            className="input"
            value={d.neighborhood}
            onChange={(e) => set('neighborhood', e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="label">Dirección aproximada</label>
        <input
          className="input"
          value={d.approximateAddress}
          placeholder="Cerca de…"
          onChange={(e) => set('approximateAddress', e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Precio (€/mes)</label>
          <input
            type="number"
            className="input"
            value={d.price}
            onChange={(e) => set('price', Number(e.target.value))}
          />
        </div>
        <div>
          <label className="label">Fianza (€)</label>
          <input
            type="number"
            className="input"
            value={d.deposit}
            onChange={(e) => set('deposit', Number(e.target.value))}
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="label">Habitaciones</label>
          <input
            type="number"
            className="input"
            value={d.rooms}
            onChange={(e) => set('rooms', Number(e.target.value))}
          />
        </div>
        <div>
          <label className="label">Baños</label>
          <input
            type="number"
            className="input"
            value={d.bathrooms}
            onChange={(e) => set('bathrooms', Number(e.target.value))}
          />
        </div>
        <div>
          <label className="label">Compañeros</label>
          <input
            type="number"
            className="input"
            value={d.currentRoommates}
            onChange={(e) => set('currentRoommates', Number(e.target.value))}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Disponible desde</label>
          <input
            type="date"
            className="input"
            value={d.availableFrom}
            onChange={(e) => set('availableFrom', e.target.value)}
          />
        </div>
        <div>
          <label className="label">Estancia mínima (meses)</label>
          <input
            type="number"
            className="input"
            value={d.minStayMonths}
            onChange={(e) => set('minStayMonths', Number(e.target.value))}
          />
        </div>
      </div>

      <Toggle
        label="Gastos incluidos"
        value={d.expensesIncluded}
        onChange={(v) => set('expensesIncluded', v)}
      />
      <Toggle
        label="Yo también vivo en este piso"
        value={d.ownerLivesHere}
        onChange={(v) => set('ownerLivesHere', v)}
      />

      <div>
        <label className="label">Descripción</label>
        <textarea
          className="input min-h-[80px]"
          value={d.description}
          onChange={(e) => set('description', e.target.value)}
        />
      </div>

      {/* --- Media: fotos, planos, vídeos --- */}
      <MediaUpload
        label="Fotos"
        icon={<CameraIcon width={16} height={16} />}
        items={d.photos}
        onAdd={(files) => addImages(files, 'photos')}
        onRemove={(i) => set('photos', d.photos.filter((_, idx) => idx !== i))}
      />
      <MediaUpload
        label="Planos"
        icon={<FileIcon width={16} height={16} />}
        items={d.plans}
        onAdd={(files) => addImages(files, 'plans')}
        onRemove={(i) => set('plans', d.plans.filter((_, idx) => idx !== i))}
      />

      <div>
        <label className="label">Vídeos (enlace)</label>
        <div className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="https://… (YouTube, Vimeo, etc.)"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
          />
          <button
            type="button"
            className="btn-secondary px-3"
            onClick={() => {
              const v = videoUrl.trim();
              if (v) {
                set('videos', [...d.videos, v]);
                setVideoUrl('');
              }
            }}
          >
            <PlusIcon width={18} height={18} />
          </button>
        </div>
        {d.videos.length > 0 && (
          <ul className="mt-2 space-y-1">
            {d.videos.map((v, i) => (
              <li key={i} className="flex items-center justify-between text-sm text-gray-600">
                <span className="truncate">{v}</span>
                <button
                  type="button"
                  onClick={() => set('videos', d.videos.filter((_, idx) => idx !== i))}
                  className="text-red-500 shrink-0 ml-2"
                >
                  <XIcon width={16} height={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {uploading && <p className="text-sm text-brand-600">Subiendo imágenes…</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-3 pt-1">
        <button type="button" className="btn-secondary flex-1" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary flex-1" disabled={uploading}>
          Publicar
        </button>
      </div>
    </form>
  );
}

function MediaUpload({
  label,
  icon,
  items,
  onAdd,
  onRemove,
}: {
  label: string;
  icon: React.ReactNode;
  items: string[];
  onAdd: (files: FileList | null) => void;
  onRemove: (index: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex flex-wrap gap-2">
        {items.map((src, i) => (
          <div key={i} className="relative">
            <img src={src} alt="" className="w-16 h-16 rounded-lg object-cover border border-gray-200" />
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center"
            >
              <XIcon width={12} height={12} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 text-gray-400 flex flex-col items-center justify-center gap-0.5 hover:border-brand-400 hover:text-brand-500"
        >
          {icon}
          <span className="text-[10px]">Añadir</span>
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          onAdd(e.target.files);
          e.target.value = '';
        }}
      />
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

/** Convierte un borrador en los campos de Property (incluidas fotos y media). */
export function draftToPropertyData(
  draft: PropertyDraft,
  ownerId: string,
): Omit<Property, 'id' | 'createdAt' | 'updatedAt'> {
  const { photos, plans, videos, ownerLivesHere, ...rest } = draft;
  return {
    ...rest,
    ownerId,
    photos: photos.map((url, i) => ({
      id: `ph-${Date.now()}-${i}`,
      propertyId: '',
      url,
      isMain: i === 0,
    })),
    plans,
    videos,
    ownerLivesHere,
    residentIds: [],
    rules: {
      smoking: false,
      pets: false,
      couples: true,
      visits: 'medias',
      parties: 'a veces',
      cleaning: 'media',
    },
    verifiedProperty: false,
    verifiedOwner: false,
    hasVideo: videos.length > 0,
  };
}
