import type { PaymentStatus } from '@/types';

const CONFIG: Record<PaymentStatus, { label: string; className: string }> = {
  pagado: { label: 'Pagado', className: 'bg-emerald-50 text-emerald-600' },
  pendiente: { label: 'Pendiente', className: 'bg-amber-50 text-amber-600' },
  retrasado: { label: 'Retrasado', className: 'bg-red-50 text-red-600' },
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const cfg = CONFIG[status];
  return <span className={`chip ${cfg.className}`}>{cfg.label}</span>;
}
