import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Avatar } from '@/components/common/Avatar';
import { TrustBadge } from '@/components/badges/TrustBadge';
import { CompatibilityScore } from '@/components/common/CompatibilityScore';
import { ReviewSummary } from '@/components/reviews/ReviewSummary';
import { ChevronLeft, MapPinIcon } from '@/components/common/icons';
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

  if (!property) return <Navigate to="/discover" replace />;

  const owner = getUser(property.ownerId);
  const compat = calculateUserPropertyCompatibility(me, property);
  const main = property.photos.find((p) => p.isMain) ?? property.photos[0];

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
          {main && <img src={main.url} alt={property.title} className="w-full h-full object-cover" />}
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

        {owner && (
          <button
            onClick={() => navigate(`/users/${owner.id}`)}
            className="card p-4 w-full flex items-center gap-3 text-left hover:bg-gray-50"
          >
            <Avatar name={owner.name} photoUrl={owner.photoUrl} size={48} />
            <div className="flex-1">
              <div className="text-xs text-gray-400">Propietario</div>
              <div className="font-semibold text-gray-900">{owner.name}</div>
            </div>
            <span className="text-brand-500 text-sm font-semibold">Ver perfil →</span>
          </button>
        )}

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
