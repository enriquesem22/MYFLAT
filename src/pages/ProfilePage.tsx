import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Avatar } from '@/components/common/Avatar';
import { ProfileLevelBadge } from '@/components/badges/ProfileLevelBadge';
import { ProfileCompletion } from '@/components/profile/ProfileCompletion';
import { ReferenceCard } from '@/components/reviews/ReferenceCard';
import { ReviewSummary } from '@/components/reviews/ReviewSummary';
import {
  InstagramIcon,
  LinkedinIcon,
  PhoneIcon,
  SettingsIcon,
  ShieldIcon,
} from '@/components/common/icons';
import { useAppStore } from '@/store/useAppStore';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { ROLE_LABELS } from '@/utils/formatting';

export function ProfilePage() {
  const navigate = useNavigate();
  const me = useCurrentUser()!;
  const updateCurrentUser = useAppStore((s) => s.updateCurrentUser);
  const references = useAppStore((s) => s.references.filter((r) => r.userId === me.id));
  const reviews = useAppStore((s) => s.reviews.filter((r) => r.reviewedUserId === me.id));
  const getUser = useAppStore((s) => s.getUser);

  return (
    <AppLayout
      title="Perfil"
      headerRight={
        <button onClick={() => navigate('/settings')} className="text-gray-400 hover:text-gray-600">
          <SettingsIcon width={22} height={22} />
        </button>
      }
    >
      <div className="p-4 space-y-4">
        {/* Cabecera de perfil */}
        <div className="card p-4">
          <div className="flex items-center gap-4">
            <Avatar name={me.name} photoUrl={me.photoUrl} size={72} />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">
                {me.name}
                {me.age ? `, ${me.age}` : ''}
              </h2>
              <p className="text-sm text-gray-500">
                {ROLE_LABELS[me.role]} · {me.city || 'Sin ciudad'}
              </p>
              <div className="mt-1.5">
                <ProfileLevelBadge user={me} size="sm" />
              </div>
            </div>
          </div>
          {me.bio && <p className="text-sm text-gray-600 mt-3">{me.bio}</p>}
          <button className="btn-secondary w-full mt-3" onClick={() => navigate('/profile/edit')}>
            Editar perfil
          </button>
        </div>

        {/* Completar perfil */}
        <ProfileCompletion user={me} onTaskClick={() => navigate('/profile/edit')} />

        {/* Confianza */}
        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-1">Confianza y verificación</h3>
          <p className="text-xs text-gray-400 mb-3">
            Tú decides cuándo compartes tus redes. Antes del match solo se ve que están
            conectadas, nunca el enlace.
          </p>
          <div className="space-y-2">
            <TrustAction
              icon={<InstagramIcon width={18} height={18} />}
              label="Instagram"
              connected={Boolean(me.instagramUrl)}
              connectedLabel="Añadido"
              actionLabel="Añadir Instagram"
              onClick={() => navigate('/profile/edit')}
            />
            <TrustAction
              icon={<LinkedinIcon width={18} height={18} />}
              label="LinkedIn"
              connected={Boolean(me.linkedinUrl)}
              connectedLabel="Añadido"
              actionLabel="Añadir LinkedIn"
              onClick={() => navigate('/profile/edit')}
            />
            <TrustAction
              icon={<PhoneIcon width={18} height={18} />}
              label="Teléfono"
              connected={me.phoneVerified}
              connectedLabel="Verificado"
              actionLabel="Verificar teléfono"
              onClick={() => updateCurrentUser({ phoneVerified: !me.phoneVerified })}
            />
            <TrustAction
              icon={<ShieldIcon width={18} height={18} />}
              label="Identidad"
              connected={me.identityVerified}
              connectedLabel="Verificada"
              actionLabel="Verificar identidad"
              onClick={() => updateCurrentUser({ identityVerified: !me.identityVerified })}
            />
          </div>
          <p className="text-[11px] text-gray-400 mt-3">
            En esta versión de prueba la verificación es simulada. No se guarda ningún
            documento ni dato biométrico real.
          </p>
        </div>

        {/* Referencias */}
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="font-semibold text-gray-900">Referencias ({references.length})</h3>
            <button
              className="text-sm text-brand-500 font-semibold"
              onClick={() => navigate('/my-flat/reviews')}
            >
              Pedir referencia
            </button>
          </div>
          {references.length === 0 ? (
            <p className="text-sm text-gray-400 px-1">
              Aún no tienes referencias. Pide una a un ex-compañero o casero.
            </p>
          ) : (
            <div className="space-y-2">
              {references.map((r) => (
                <ReferenceCard key={r.id} reference={r} />
              ))}
            </div>
          )}
        </div>

        {/* Valoraciones recibidas */}
        {reviews.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2 px-1">
              Valoraciones ({reviews.length})
            </h3>
            <div className="space-y-2">
              {reviews.map((rev) => {
                const reviewer = getUser(rev.reviewerId);
                return (
                  <ReviewSummary
                    key={rev.id}
                    review={rev}
                    reviewerName={reviewer?.name}
                    reviewerPhoto={reviewer?.photoUrl}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function TrustAction({
  icon,
  label,
  connected,
  onClick,
  connectedLabel = 'Conectado',
  actionLabel,
}: {
  icon: React.ReactNode;
  label: string;
  connected: boolean;
  onClick: () => void;
  connectedLabel?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center">
        {icon}
      </div>
      <span className="flex-1 text-sm font-medium text-gray-700">{label}</span>
      {connected ? (
        <button
          onClick={onClick}
          className="chip bg-emerald-50 text-emerald-600"
          title="Pulsa para desconectar (demo)"
        >
          {connectedLabel} ✓
        </button>
      ) : (
        <button onClick={onClick} className="btn-secondary py-1.5 px-3 text-xs">
          {actionLabel ?? `Conectar ${label}`}
        </button>
      )}
    </div>
  );
}
