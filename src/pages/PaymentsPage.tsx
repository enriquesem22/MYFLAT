import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PaymentCard } from '@/components/payments/PaymentCard';
import { EmptyState } from '@/components/common/EmptyState';
import { ChevronLeft, EuroIcon } from '@/components/common/icons';
import { useAppStore } from '@/store/useAppStore';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { formatDate, formatMoney } from '@/utils/formatting';

export function PaymentsPage() {
  const navigate = useNavigate();
  const me = useCurrentUser()!;
  const isOwner = me.role === 'owner';
  const payments = useAppStore((s) => s.payments);
  const getUser = useAppStore((s) => s.getUser);
  const markPaymentPaid = useAppStore((s) => s.markPaymentPaid);
  const confirmPayment = useAppStore((s) => s.confirmPayment);
  const [toast, setToast] = useState('');

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  }

  const mine = isOwner
    ? payments.filter((p) => p.ownerId === me.id)
    : payments.filter((p) => p.tenantId === me.id);

  const sorted = [...mine].sort((a, b) => b.dueDate.localeCompare(a.dueDate));
  const nextDue = sorted.find((p) => p.status !== 'pagado');

  return (
    <AppLayout hideHeader>
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-100 px-2 h-14 flex items-center gap-2">
        <button onClick={() => navigate('/my-flat')} className="p-2 text-gray-500">
          <ChevronLeft width={22} height={22} />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Pagos</h1>
      </header>

      <div className="p-4 space-y-4">
        {mine.length === 0 ? (
          <EmptyState
            icon={<EuroIcon width={28} height={28} />}
            title="No hay pagos pendientes"
            description={
              isOwner
                ? 'Cuando tengas inquilinos, aquí verás y confirmarás sus pagos.'
                : 'Cuando entres en un piso, aquí gestionarás el alquiler.'
            }
          />
        ) : (
          <>
            {/* Resumen próximo pago (inquilino) */}
            {!isOwner && nextDue && (
              <div className="card p-4 bg-brand-500 text-white border-0">
                <div className="text-sm text-white/80">Próximo pago</div>
                <div className="text-2xl font-bold">{formatMoney(nextDue.amount)}</div>
                <div className="text-sm text-white/80">
                  Vence {formatDate(nextDue.dueDate)} ·{' '}
                  {nextDue.status === 'retrasado' ? 'Retrasado' : 'Pendiente'}
                </div>
              </div>
            )}

            {isOwner ? (
              <p className="text-sm text-gray-500 px-1">
                Pagos de tus inquilinos. Confirma cuando recibas el importe.
              </p>
            ) : (
              <p className="text-sm text-gray-500 px-1">Historial de tus pagos de alquiler.</p>
            )}

            <div className="space-y-3">
              {sorted.map((p) => {
                const counterpart = isOwner ? getUser(p.tenantId) : getUser(p.ownerId);
                return (
                  <PaymentCard
                    key={p.id}
                    payment={p}
                    perspective={isOwner ? 'owner' : 'tenant'}
                    counterpartName={counterpart?.name}
                    onMarkPaid={() => {
                      markPaymentPaid(p.id);
                      notify('Marcado como pagado ✓');
                    }}
                    onUploadProof={() => {
                      markPaymentPaid(p.id, `justificante-${p.id}.pdf`);
                      notify('Justificante subido (simulado)');
                    }}
                    onConfirm={() => {
                      confirmPayment(p.id);
                      notify('Pago confirmado ✓');
                    }}
                    onRemind={() => notify('Recordatorio enviado')}
                  />
                );
              })}
            </div>

            <p className="text-[11px] text-gray-400 text-center px-4">
              En esta versión no se mueve dinero real. Los pagos por la app (con comisión de
              plataforma) llegarán en una fase futura mediante Stripe Connect o similar.
            </p>
          </>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-24 inset-x-0 flex justify-center z-50">
          <div className="bg-gray-900 text-white text-sm px-4 py-2 rounded-full shadow-lg">
            {toast}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
