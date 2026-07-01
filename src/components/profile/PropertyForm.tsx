import { useState } from 'react';
import type { Property } from '@/types';

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
  });

  function set<K extends keyof PropertyDraft>(key: K, value: PropertyDraft[K]) {
    setD((prev) => ({ ...prev, [key]: value }));
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
      <button
        type="button"
        onClick={() => set('expensesIncluded', !d.expensesIncluded)}
        className="w-full flex items-center justify-between py-1"
      >
        <span className="text-sm text-gray-700">Gastos incluidos</span>
        <span
          className={`w-11 h-6 rounded-full p-0.5 transition ${
            d.expensesIncluded ? 'bg-brand-500' : 'bg-gray-200'
          }`}
        >
          <span
            className={`block w-5 h-5 rounded-full bg-white transition ${
              d.expensesIncluded ? 'translate-x-5' : ''
            }`}
          />
        </span>
      </button>
      <div>
        <label className="label">Descripción</label>
        <textarea
          className="input min-h-[80px]"
          value={d.description}
          onChange={(e) => set('description', e.target.value)}
        />
      </div>

      <div className="flex gap-3">
        <button type="button" className="btn-secondary flex-1" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary flex-1">
          Publicar
        </button>
      </div>
    </form>
  );
}

/** Convierte un borrador en los campos de Property que faltan por defecto. */
export function draftToPropertyData(
  draft: PropertyDraft,
  ownerId: string,
): Omit<Property, 'id' | 'createdAt' | 'updatedAt' | 'photos'> {
  return {
    ...draft,
    ownerId,
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
    hasVideo: false,
  };
}
