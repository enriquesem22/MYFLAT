import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Avatar } from '@/components/common/Avatar';
import { TrustBadge } from '@/components/badges/TrustBadge';
import { CompatibilityScore } from '@/components/common/CompatibilityScore';
import { ReviewSummary } from '@/components/reviews/ReviewSummary';
import { SwipeActionsBar } from '@/components/swipe/SwipeActionsBar';
import { ChevronLeft, ChevronRight, MapPinIcon } from '@/components/common/icons';
import { useAppStore } from '@/store/useAppStore';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { calculateUserPropertyCompatibility } from '@/utils/compatibility';
import { formatDate, formatMoney } from '@/utils/formatting';

export function PropertyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const me = useCurrentUser()!;
  const property = useAppStore((s) => s.properties.find((p) => p.id === id));
  const getUser = useAppStore((s) => s.getUser);
  const reviews = useAppStore((s) => s.reviews.filter((r) => r.propertyId === id));
  const issues = useAppStore((s) =>
    s.issues.filter((i) => i.propertyId === id && i.status === 'resuelta'),
  );
  const payments = useAppStore((s) => s.payments);
  const likes = useAppStore((s) => s.likes);
  const residenceRequests = useAppStore((s) => s.residenceRequests);
  const moveIntoProperty = useAppStore((s) => s.moveIntoProperty);
  const requestResidence = useAppStore((s) => s.requestResidence);
  const swipe = useAppStore((s) => s.swipe);
  const unsave = useAppStore((s) => s.unsave);
  const [toast, setToast] = useState('');

  if (!property) return <Navigate to="/discover" replace />;

  const isOwnerOfThis = property.ownerId === me.id;
  const alreadyLivesHere = payments.some(
    (p) => p.propertyId === property.id && p.tenantId === me.id,
  );
  const owner = getUser(property.ownerId);
  const compat = calculateUserPropertyCompatibility(me, property);

  // Personas que viven aquí: SOLO residentes confirmados por el propietario
  // (+ el propietario si ha indicado que también vive en el piso).
  const confirmedIds = new Set<string>(property.residentIds ?? []);
  if (property.ownerLivesHere) confirmedIds.add(property.ownerId);
  const residents = [...confirmedIds].map((rid) => getUser(rid)).filter(Boolean);

  // Estado de la solicitud de residencia del usuario actual.
  const isConfirmedResident = confirmedIds.has(me.id);
  const hasPendingRequest = residenceRequests.some(
    (r) => r.propertyId === property.id && r.userId === me.id && r.status === 'pendiente',
  );

  const plans = property.plans ?? [];
  const videos = property.videos ?? [];
  const isSaved = likes.some(
    (l) => l.fromUserId === me.id && l.targetId === property.id && l.direction === 'save',
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
          {property.photos[0] ? (
            <img
              src={(property.photos.find((p) => p.isMain) ?? property.photos[0]).url}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              Sin foto
            </div>
          )}
        </div>
        {property.photos.length > 1 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 -mt-8 relative">
            {property.photos.map((ph) => (
              <img
                key={ph.id}
                src={ph.url}
                alt=""
                className="w-20 h-20 rounded-xl object-cover border-2 border-white shadow"
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        <div className="card p-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{property.title}</h2>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <MapPinIcon width={14} height={14} />
                {property.neighborhood}, {property.city} · {property.approximateAddress}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{formatMoney(property.price)}</div>
              <div className="text-xs text-gray-400">/mes</div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {property.verifiedOwner && <TrustBadge kind="verified-owner" />}
            {property.verifiedProperty && <TrustBadge kind="verified-property" />}
            {property.hasVideo && <TrustBadge kind="has-video" />}
          </div>

          {property.description && (
            <p className="text-sm text-gray-600 mt-3">{property.description}</p>
          )}
        </div>

        {/* Activar "Mi piso": para quien busca (no el propietario del anuncio) */}
        {!isOwnerOfThis && (
          <div className="card p-4">
            {alreadyLivesHere ? (
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-gray-900">Ya vives aquí ✅</div>
                  <div className="text-sm text-gray-500">
                    Gestiona pagos e incidencias en tu panel.
                  </div>
                </div>
                <button className="btn-primary shrink-0" onClick={() => navigate('/my-flat')}>
                  Ir a Mi piso
                </button>
              </div>
            ) : (
              <>
                <div className="font-semibold text-gray-900">¿Has conseguido este piso?</div>
                <p className="text-sm text-gray-500 mt-0.5 mb-3">
                  Actívalo como tu piso para gestionar el alquiler, los pagos y las
                  incidencias desde Myflat.
                </p>
                <button
                  className="btn-primary w-full"
                  onClick={() => {
                    if (moveIntoProperty(property.id)) {
                      navigate('/my-flat');
                    }
                  }}
                >
                  Ya vivo aquí — activar Mi piso
                </button>
              </>
            )}
          </div>
        )}

        <div className="card p-4">
          <CompatibilityScore result={compat} />
        </div>

        <div className="card p-4 grid grid-cols-2 gap-3 text-sm">
          <Info label="Disponible desde" value={formatDate(property.availableFrom)} />
          <Info label="Estancia mínima" value={`${property.minStayMonths} meses`} />
          <Info label="Fianza" value={formatMoney(property.deposit)} />
          <Info label="Gastos" value={property.expensesIncluded ? 'Incluidos' : 'No incluidos'} />
          <Info label="Habitaciones" value={`${property.rooms}`} />
          <Info label="Baños" value={`${property.bathrooms}`} />
          <Info label="Compañeros" value={`${property.currentRoommates}`} />
        </div>

        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Normas del piso</h3>
          <div className="flex flex-wrap gap-1.5 text-sm">
            <Rule ok={property.rules.smoking} label="Fumar" />
            <Rule ok={property.rules.pets} label="Mascotas" />
            <Rule ok={property.rules.couples} label="Parejas" />
            <span className="chip bg-gray-100 text-gray-600">Visitas: {property.rules.visits}</span>
            <span className="chip bg-gray-100 text-gray-600">Fiestas: {property.rules.parties}</span>
            <span className="chip bg-gray-100 text-gray-600">Limpieza: {property.rules.cleaning}</span>
          </div>
        </div>

        {/* Planos */}
        {plans.length > 0 && (
          <div className="card p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Planos</h3>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {plans.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`Plano ${i + 1}`}
                  className="h-40 rounded-xl object-cover border border-gray-200"
                />
              ))}
            </div>
          </div>
        )}

        {/* Vídeos */}
        {videos.length > 0 && (
          <div className="card p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Vídeos</h3>
            <ul className="space-y-1.5">
              {videos.map((v, i) => (
                <li key={i}>
                  <a
                    href={v}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-brand-600 underline break-all"
                  >
                    ▶ Ver vídeo {i + 1}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Propietario / responsable del anuncio */}
        {owner && (
          <div className="card p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Propietario / responsable</h3>
            <button
              onClick={() => navigate(`/users/${owner.id}`)}
              className="w-full flex items-center gap-3 text-left"
            >
              <Avatar name={owner.name} photoUrl={owner.photoUrl} size={48} />
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{owner.name}</div>
                <div className="text-xs text-gray-400">
                  {property.ownerLivesHere ? 'También vive en el piso' : 'Gestiona el anuncio'}
                </div>
              </div>
              <ChevronRight width={18} height={18} className="text-gray-300" />
            </button>
          </div>
        )}

        {/* Personas que viven actualmente en el piso */}
        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-1">Personas que viven aquí</h3>

          {/* Solicitud de residencia (para quien no es el propietario) */}
          {!isOwnerOfThis && (
            <div className="mb-3">
              {isConfirmedResident ? (
                <span className="chip bg-emerald-50 text-emerald-600">
                  Vives aquí · confirmado por el propietario ✅
                </span>
              ) : hasPendingRequest ? (
                <span className="chip bg-amber-50 text-amber-600">
                  Solicitud enviada · pendiente de confirmación
                </span>
              ) : (
                <button
                  className="btn-secondary w-full"
                  onClick={() => {
                    requestResidence(property.id);
                    notify('Solicitud enviada al propietario');
                  }}
                >
                  Solicitar aparecer como residente
                </button>
              )}
            </div>
          )}

          {residents.length === 0 ? (
            <p className="text-sm text-gray-400">
              Todavía no hay residentes confirmados.
            </p>
          ) : (
            <div className="space-y-3 mt-2">
              {residents.map((r) => (
                <button
                  key={r!.id}
                  onClick={() => navigate(`/users/${r!.id}`)}
                  className="w-full flex items-center gap-3 text-left"
                >
                  <Avatar name={r!.name} photoUrl={r!.photoUrl} size={42} />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {r!.name}
                      {r!.id === property.ownerId && (
                        <span className="ml-1 text-xs text-gold-600">(propietario)</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">{r!.profession || 'Residente'}</div>
                  </div>
                  <ChevronRight width={18} height={18} className="text-gray-300" />
                </button>
              ))}
            </div>
          )}
        </div>

        {issues.length > 0 && (
          <div className="card p-4">
            <h3 className="font-semibold text-gray-900 mb-1">Incidencias resueltas</h3>
            <p className="text-xs text-gray-400 mb-2">
              Historial de mantenimiento del piso ({issues.length}).
            </p>
            <ul className="space-y-1 text-sm text-gray-600">
              {issues.map((i) => (
                <li key={i.id} className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span>
                  {i.title}
                </li>
              ))}
            </ul>
          </div>
        )}

        {reviews.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2 px-1">Valoraciones del piso</h3>
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

      {/* Acciones de swipe dentro del perfil (si no es tu propio anuncio) */}
      {!isOwnerOfThis && (
        <SwipeActionsBar
          saved={isSaved}
          onDislike={() => {
            swipe('property', property.id, 'dislike');
            navigate('/discover');
          }}
          onSave={() => {
            if (isSaved) {
              unsave(property.id);
              notify('Quitado de guardados');
            } else {
              swipe('property', property.id, 'save');
              notify('Guardado ✓');
            }
          }}
          onLike={() => {
            const m = swipe('property', property.id, 'like');
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
      <div className="font-medium text-gray-700">{value}</div>
    </div>
  );
}

function Rule({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`chip ${ok ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
      {ok ? '✓' : '✕'} {label}
    </span>
  );
}
