import type { Payment } from '@/types';
import { PaymentStatusBadge } from '@/components/badges/PaymentStatusBadge';
import { formatDate, formatMoney } from '@/utils/formatting';

interface Props {
  payment: Payment;
  /** Perspectiva: inquilino o propietario. */
  perspective: 'tenant' | 'owner';
  counterpartName?: string;
  onMarkPaid?: () => void;
  onUploadProof?: () => void;
  onConfirm?: () => void;
  onRemind?: () => void;
}

// Tarjeta de un pago mensual con acciones según la perspectiva.
export function PaymentCard({
  payment,
  perspective,
  counterpartName,
  onMarkPaid,
  onUploadProof,
  onConfirm,
  onRemind,
}: Props) {
  const month = new Date(payment.dueDate).toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-gray-400 capitalize">{month}</div>
          <div className="text-xl font-bold text-gray-900">{formatMoney(payment.amount)}</div>
          {counterpartName && (
            <div className="text-sm text-gray-500">{counterpartName}</div>
          )}
        </div>
        <PaymentStatusBadge status={payment.status} />
      </div>

      <div className="mt-2 text-sm text-gray-500">Vence: {formatDate(payment.dueDate)}</div>
      {payment.proofUrl && (
        <div className="mt-1 text-xs text-brand-500">Justificante: {payment.proofUrl}</div>
      )}

      {/* Acciones inquilino */}
      {perspective === 'tenant' && payment.status !== 'pagado' && (
        <div className="mt-3 space-y-2">
          <button className="btn-primary w-full" onClick={onMarkPaid}>
            Marcar como pagado
          </button>
          <button className="btn-secondary w-full" onClick={onUploadProof}>
            Subir justificante
          </button>
          <button className="btn-ghost w-full text-gray-400" disabled>
            Pagar por la app — próximamente
          </button>
        </div>
      )}
      {perspective === 'tenant' && payment.status === 'pagado' && !payment.confirmedAt && (
        <p className="mt-3 text-xs text-gray-400">
          Marcado como pagado. Pendiente de confirmación del propietario.
        </p>
      )}

      {/* Acciones propietario */}
      {perspective === 'owner' && payment.status !== 'pagado' && (
        <div className="mt-3 flex gap-2">
          <button className="btn-primary flex-1" onClick={onConfirm}>
            Confirmar recibido
          </button>
          <button className="btn-secondary flex-1" onClick={onRemind}>
            Recordar pago
          </button>
        </div>
      )}
      {perspective === 'owner' && payment.status === 'pagado' && !payment.confirmedAt && (
        <button className="btn-primary w-full mt-3" onClick={onConfirm}>
          Confirmar recibido
        </button>
      )}
    </div>
  );
}
