import { useState } from 'react';
import type { IssueCategory, IssueUrgency } from '@/types';

const CATEGORIES: IssueCategory[] = [
  'Lavadora',
  'Internet',
  'Humedad',
  'Llaves',
  'Calefacción',
  'Aire acondicionado',
  'Ruido',
  'Limpieza',
  'Electricidad',
  'Fontanería',
  'Otro',
];

const URGENCIES: IssueUrgency[] = ['baja', 'media', 'alta'];

export interface IssueDraft {
  title: string;
  category: IssueCategory;
  description: string;
  urgency: IssueUrgency;
  photoUrl?: string;
}

interface Props {
  onSubmit: (draft: IssueDraft) => void;
  onCancel: () => void;
}

// Flujo rápido: categoría → descripción → foto opcional → urgencia → enviar.
export function IssueForm({ onSubmit, onCancel }: Props) {
  const [category, setCategory] = useState<IssueCategory>('Lavadora');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<IssueUrgency>('media');
  const [hasPhoto, setHasPhoto] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          title: title.trim() || category,
          category,
          description: description.trim(),
          urgency,
          photoUrl: hasPhoto ? 'foto-incidencia.jpg' : undefined,
        });
      }}
      className="space-y-5"
    >
      <div>
        <label className="label">Categoría</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => setCategory(c)}
              className={`chip border ${
                category === c
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Título</label>
        <input
          className="input"
          value={title}
          placeholder="Ej. Lavadora rota"
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div>
        <label className="label">Descripción</label>
        <textarea
          className="input min-h-[100px]"
          value={description}
          placeholder="Cuenta qué pasa con el mayor detalle posible…"
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="label">Foto (opcional)</label>
        <button
          type="button"
          onClick={() => setHasPhoto((v) => !v)}
          className={`btn-secondary w-full ${hasPhoto ? 'border-brand-400 text-brand-600' : ''}`}
        >
          {hasPhoto ? 'Foto añadida ✓ (simulada)' : 'Añadir foto'}
        </button>
      </div>

      <div>
        <label className="label">Urgencia</label>
        <div className="grid grid-cols-3 gap-2">
          {URGENCIES.map((u) => (
            <button
              type="button"
              key={u}
              onClick={() => setUrgency(u)}
              className={`btn capitalize ${
                urgency === u ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button type="button" className="btn-secondary flex-1" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary flex-1">
          Enviar
        </button>
      </div>
    </form>
  );
}
