import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProfileLevelBadge } from '@/components/badges/ProfileLevelBadge';
import { TrustBadge } from '@/components/badges/TrustBadge';
import { ReviewSummary } from '@/components/reviews/ReviewSummary';
import { CompatibilityScore } from '@/components/common/CompatibilityScore';
import { SwipeActionsBar } from '@/components/swipe/SwipeActionsBar';
import { ChevronLeft, InstagramIcon, LinkedinIcon } from '@/components/common/icons';
import { useAppStore } from '@/store/useAppStore';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { calculateUserUserCompatibility } from '@/utils/compatibility';
import { formatDate, formatMoney, ROLE_LABELS } from '@/utils/formatting';

export function UserProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const me = useCurrentUser()!;
  const user = useAppStore((s) => s.getUser(id ?? ''));
  const matches = useAppStore((s) => s.matches);
  const reviews = useAppStore((s) => s.reviews.filter((r) => r.reviewedUserId === id));
  const getUser = useAppStore((s) => s.getUser);
  const likes = useAppStore((s) => s.likes);
  const swipe = useAppStore((s) => s.swipe);
  const unsave = useAppStore((s) => s.unsave);
  const [toast, setToast] = useState('');

  if (!user) return <Navigate to="/discover" replace />;

  // Solo se muestran los enlaces reales de redes si hay match mutuo (privacidad).
  const isMatched = matches.some(
    (m) =>
      (m.userAId === me.id && m.userBId === user.id) ||
      (m.userBId === me.id && m.userAId === user.id),
  );

  const compat = calculateUserUserCompatibility(me, user);
  const isSelf = user.id === me.id;
  const isSaved = likes.some(
    (l) => l.fromUserId === me.id && l.targetId === user.id && l.direction === 'save',
  );

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  }

  return (
    <AppLayout hideNav hideHeader>
      <div className="relative">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-3 left-3 z-10 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center text-gray-600"
        >
          <ChevronLeft width={22} height={22} />
        </button>
        <div className="h-64 bg-gray-100">
          {user.photoUrl && (
            <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
          )}
        </div>
      </div>

      <div className="p-4 space-y-4 -mt-6">
        <div className="card p-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-900">
              {user.name}, {user.age}
            </h2>
            <ProfileLevelBadge user={user} showLabel={false} />
          </div>
          <p className="text-sm text-gray-500">
            {ROLE_LABELS[user.role]} · {user.city} · {user.profession}
          </p>
          {user.bio && <p className="text-sm text-gray-600 mt-2">{user.bio}</p>}

          <div className="mt-3 flex flex-wrap gap-1.5">
            <ProfileLevelBadge user={user} size="sm" />
            {user.identityVerified && <TrustBadge kind="identity" />}
            {user.referencesCount > 0 && (
              <TrustBadge kind="has-references" label={`${user.referencesCount} referencias`} />
            )}
          </div>
        </div>

        <div className="card p-4">
          <CompatibilityScore result={compat} />
        </div>

        <div className="card p-4 grid grid-cols-2 gap-3 text-sm">
          <Info label="Presupuesto" value={formatMoney(user.budget)} />
          <Info label="Entrada" value={formatDate(user.moveInDate)} />
          <Info label="Convivencia" value={user.preferences.lifestylePreference} />
          <Info label="Limpieza" value={user.preferences.cleaningLevel} />
          <Info label="Fumador/a" value={user.preferences.smoking ? 'Sí' : 'No'} />
          <Info label="Mascotas" value={user.preferences.pets ? 'Sí' : 'No'} />
        </div>

        {/* Redes: solo tras match */}
        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Redes</h3>
          {isMatched ? (
            <div className="space-y-2">
              {user.instagramUrl ? (
                <a
                  className="flex items-center gap-2 text-sm text-brand-600 break-all"
                  href={normalizeUrl(user.instagramUrl)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <InstagramIcon width={18} height={18} /> {user.instagramUrl}
                </a>
              ) : null}
              {user.linkedinUrl ? (
                <a
                  className="flex items-center gap-2 text-sm text-brand-600 break-all"
                  href={normalizeUrl(user.linkedinUrl)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <LinkedinIcon width={18} height={18} /> {user.linkedinUrl}
                </a>
              ) : null}
              {!user.instagramUrl && !user.linkedinUrl && (
                <p className="text-sm text-gray-400">No ha añadido redes.</p>
              )}
            </div>
          ) : (
            <div className="space-y-1.5">
              {user.instagramConnected && <TrustBadge kind="instagram" />}
              {user.linkedinConnected && <TrustBadge kind="linkedin" />}
              {!user.instagramConnected && !user.linkedinConnected && (
                <p className="text-sm text-gray-400">No ha conectado redes.</p>
              )}
              {(user.instagramConnected || user.linkedinConnected) && (
                <p className="text-xs text-gray-400 mt-2">
                  Los enlaces completos solo se muestran cuando hacéis match.
                </p>
              )}
            </div>
          )}
        </div>

        {reviews.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2 px-1">Valoraciones</h3>
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

      {/* Acciones de swipe dentro del perfil (si no eres tú) */}
      {!isSelf && (
        <SwipeActionsBar
          saved={isSaved}
          onDislike={() => {
            swipe('user', user.id, 'dislike');
            navigate('/discover');
          }}
          onSave={() => {
            if (isSaved) {
              unsave(user.id);
              notify('Quitado de guardados');
            } else {
              swipe('user', user.id, 'save');
              notify('Guardado ✓');
            }
          }}
          onLike={() => {
            const m = swipe('user', user.id, 'like');
            if (m) navigate(`/matches/${m.id}`);
            else navigate('/discover');
          }}
        />
      )}

      {toast && (
        <div className="fixed bottom-28 inset-x-0 flex justify-center z-50 pointer-events-none">
          <div className="bg-gray-900 text-white text-sm px-4 py-2 rounded-full shadow-lg">
            {toast}
          </div>
        </div>
      )}
    </AppLayout>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 px-2.5 py-1.5">
      <div className="text-[11px] text-gray-400">{label}</div>
      <div className="font-medium text-gray-700 capitalize">{value}</div>
    </div>
  );
}

/** Asegura que el enlace tenga protocolo para abrirse correctamente. */
function normalizeUrl(url: string): string {
  const u = url.trim();
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
}
