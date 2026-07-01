import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Avatar } from '@/components/common/Avatar';
import { ChevronLeft, ChevronRight, LogoutIcon } from '@/components/common/icons';
import { useAppStore } from '@/store/useAppStore';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { ROLE_LABELS } from '@/utils/formatting';

export function SettingsPage() {
  const navigate = useNavigate();
  const me = useCurrentUser()!;
  const logout = useAppStore((s) => s.logout);
  const resetDemo = useAppStore((s) => s.resetDemo);

  function handleLogout() {
    logout();
    navigate('/');
  }

  function handleReset() {
    if (confirm('¿Restablecer todos los datos demo? Se perderán tus cambios locales.')) {
      resetDemo();
      navigate('/');
    }
  }

  return (
    <AppLayout hideHeader>
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-100 px-2 h-14 flex items-center gap-2">
        <button onClick={() => navigate(-1)} className="p-2 text-gray-500">
          <ChevronLeft width={22} height={22} />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Ajustes</h1>
      </header>

      <div className="p-4 space-y-4">
        <button
          onClick={() => navigate('/profile/edit')}
          className="card p-4 w-full flex items-center gap-3 text-left"
        >
          <Avatar name={me.name} photoUrl={me.photoUrl} size={52} />
          <div className="flex-1">
            <div className="font-semibold text-gray-900">{me.name}</div>
            <div className="text-sm text-gray-500">{ROLE_LABELS[me.role]}</div>
          </div>
          <ChevronRight width={20} height={20} className="text-gray-300" />
        </button>

        <div className="card divide-y divide-gray-100">
          <Row label="Editar perfil" onClick={() => navigate('/profile/edit')} />
          <Row label="Mi piso" onClick={() => navigate('/my-flat')} />
          <Row label="Pagos" onClick={() => navigate('/my-flat/payments')} />
          <Row label="Incidencias" onClick={() => navigate('/my-flat/issues')} />
          <Row label="Valoraciones y referencias" onClick={() => navigate('/my-flat/reviews')} />
        </div>

        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-1">Privacidad</h3>
          <p className="text-sm text-gray-500">
            Myflat no guarda documentos de identidad ni datos biométricos reales en esta versión.
            La verificación es simulada. Tus redes sociales solo se muestran completas tras un
            match o si tú lo autorizas.
          </p>
        </div>

        <button onClick={handleReset} className="btn-secondary w-full">
          Restablecer datos demo
        </button>

        <button onClick={handleLogout} className="btn w-full text-red-600 hover:bg-red-50">
          <LogoutIcon width={18} height={18} /> Cerrar sesión
        </button>

        <p className="text-center text-xs text-gray-400 pt-2">Myflat · MVP de demostración</p>
      </div>
    </AppLayout>
  );
}

function Row({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between px-4 py-3.5 text-left">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <ChevronRight width={18} height={18} className="text-gray-300" />
    </button>
  );
}
