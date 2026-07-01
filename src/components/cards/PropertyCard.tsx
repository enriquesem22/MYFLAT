import type { Property } from '@/types';
import type { CompatibilityResult } from '@/utils/compatibility';
import { formatDate, formatMoney } from '@/utils/formatting';
import { TrustBadge } from '@/components/badges/TrustBadge';
import { CalendarIcon, MapPinIcon, UserIcon } from '@/components/common/icons';

interface Props {
  property: Property;
  compatibility?: CompatibilityResult;
}

/** Contenido de una tarjeta de habitación/piso (foto + datos + badges). */
export function PropertyCard({ property, compatibility }: Props) {
  const main = property.photos.find((p) => p.isMain) ?? property.photos[0];

  return (
    <div className="flex flex-col h-full">
      <div className="relative h-1/2 min-h-[45%] bg-gray-100">
        {main ? (
          <img src={main.url} alt={property.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            Sin foto
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-white/90 text-sm flex items-center gap-1">
                <MapPinIcon width={14} height={14} />
                {property.neighborhood}, {property.city}
              </div>
              <div className="text-white text-2xl font-bold">
                {formatMoney(property.price)}
                <span className="text-sm font-medium text-white/80">/mes</span>
              </div>
            </div>
            {compatibility && (
              <div className="bg-white/95 rounded-xl px-2.5 py-1 text-center">
                <div className="text-lg font-bold text-emerald-600 leading-none">
                  {compatibility.score}%
                </div>
                <div className="text-[10px] text-gray-500 font-medium">compatible</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto no-scrollbar">
        <h3 className="text-lg font-bold text-gray-900">{property.title}</h3>

        <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <CalendarIcon width={14} height={14} /> Disponible {formatDate(property.availableFrom)}
          </span>
          <span className="flex items-center gap-1">
            <UserIcon width={14} height={14} /> {property.currentRoommates} compañeros
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <Info label="Fianza" value={formatMoney(property.deposit)} />
          <Info
            label="Gastos"
            value={property.expensesIncluded ? 'Incluidos' : 'No incluidos'}
          />
          <Info label="Estancia mínima" value={`${property.minStayMonths} meses`} />
          <Info label="Habitaciones" value={`${property.rooms} · ${property.bathrooms} baños`} />
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {property.verifiedOwner && <TrustBadge kind="verified-owner" />}
          {property.verifiedProperty && <TrustBadge kind="verified-property" />}
          {property.hasVideo && <TrustBadge kind="has-video" />}
        </div>

        {compatibility && compatibility.reasons.length > 0 && (
          <p className="mt-3 text-xs text-gray-500">
            {`Encaja porque ${compatibility.reasons
              .map((r) => r.toLowerCase())
              .join(', ')}.`}
          </p>
        )}
      </div>
    </div>
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
