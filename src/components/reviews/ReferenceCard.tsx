import type { Reference } from '@/types';
import { StarIcon } from '@/components/common/icons';

const STATUS_LABEL: Record<Reference['status'], { label: string; className: string }> = {
  pendiente: { label: 'Pendiente', className: 'bg-amber-50 text-amber-600' },
  confirmada: { label: 'Confirmada', className: 'bg-emerald-50 text-emerald-600' },
  rechazada: { label: 'Rechazada', className: 'bg-red-50 text-red-600' },
};

export function ReferenceCard({ reference }: { reference: Reference }) {
  const status = STATUS_LABEL[reference.status];
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold text-gray-900">{reference.refereeName}</div>
          <div className="text-xs text-gray-400">{reference.relationshipType}</div>
        </div>
        <span className={`chip ${status.className}`}>{status.label}</span>
      </div>
      {reference.rating != null && (
        <div className="flex items-center gap-0.5 mt-2 text-gold-500">
          {Array.from({ length: 5 }).map((_, i) => (
            <StarIcon
              key={i}
              width={14}
              height={14}
              className={i < reference.rating! ? 'text-gold-500' : 'text-gray-200'}
            />
          ))}
        </div>
      )}
      {reference.comment && (
        <p className="text-sm text-gray-600 mt-2">“{reference.comment}”</p>
      )}
    </div>
  );
}
