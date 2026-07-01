import { useState } from 'react';
import type { ReviewType } from '@/types';
import { StarIcon } from '@/components/common/icons';

// Categorías por tipo de valoración (según especificación).
export const REVIEW_CATEGORIES: Record<ReviewType, string[]> = {
  roommate: ['Limpieza', 'Pagos', 'Ruido', 'Comunicación', 'Respeto', 'Fiabilidad'],
  tenant: ['Limpieza', 'Pagos', 'Ruido', 'Comunicación', 'Respeto', 'Fiabilidad'],
  landlord: [
    'Reparaciones',
    'Devolución de fianza',
    'Comunicación',
    'Transparencia',
    'Contrato claro',
    'Privacidad',
  ],
  property: ['Estado real', 'Ruido', 'Humedades', 'Temperatura', 'Internet', 'Comunidad'],
};

export const REVIEW_TYPE_LABELS: Record<ReviewType, string> = {
  roommate: 'Compañero/a',
  tenant: 'Inquilino/a',
  landlord: 'Propietario/a',
  property: 'Piso',
};

export interface ReviewDraft {
  reviewType: ReviewType;
  ratings: Record<string, number>;
  comment: string;
}

interface Props {
  reviewType: ReviewType;
  onSubmit: (draft: ReviewDraft) => void;
  onCancel: () => void;
}

export function ReviewForm({ reviewType, onSubmit, onCancel }: Props) {
  const categories = REVIEW_CATEGORIES[reviewType];
  const [ratings, setRatings] = useState<Record<string, number>>(
    Object.fromEntries(categories.map((c) => [c, 4])),
  );
  const [comment, setComment] = useState('');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ reviewType, ratings, comment: comment.trim() });
      }}
      className="space-y-4"
    >
      <div className="space-y-3">
        {categories.map((cat) => (
          <div key={cat} className="flex items-center justify-between">
            <span className="text-sm text-gray-700">{cat}</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  type="button"
                  key={n}
                  onClick={() => setRatings((r) => ({ ...r, [cat]: n }))}
                  aria-label={`${cat} ${n}`}
                >
                  <StarIcon
                    width={22}
                    height={22}
                    className={n <= ratings[cat] ? 'text-gold-500' : 'text-gray-200'}
                  />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div>
        <label className="label">Comentario</label>
        <textarea
          className="input min-h-[80px]"
          value={comment}
          placeholder="Cuenta tu experiencia…"
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      <p className="text-[11px] text-gray-400">
        No se permiten insultos, datos personales, acusaciones no verificadas ni comentarios
        discriminatorios.
      </p>

      <div className="flex gap-3">
        <button type="button" className="btn-secondary flex-1" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary flex-1">
          Publicar valoración
        </button>
      </div>
    </form>
  );
}
