import type { User } from '@/types';
import type { CompatibilityResult } from '@/utils/compatibility';
import { formatDate, formatMoney } from '@/utils/formatting';
import { ProfileLevelBadge } from '@/components/badges/ProfileLevelBadge';
import { TrustBadge } from '@/components/badges/TrustBadge';
import { CalendarIcon, EuroIcon, MapPinIcon } from '@/components/common/icons';

interface Props {
  user: User;
  compatibility?: CompatibilityResult;
}

/** Contenido de una tarjeta de candidato/inquilino. */
export function UserCard({ user, compatibility }: Props) {
  return (
    <div className="flex flex-col h-full">
      <div className="relative h-1/2 min-h-[45%] bg-gray-100">
        {user.photoUrl ? (
          <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            Sin foto
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-white text-2xl font-bold">
                {user.name}, {user.age}
              </div>
              <div className="text-white/90 text-sm flex items-center gap-1">
                <MapPinIcon width={14} height={14} />
                {user.city} · {user.profession}
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
        {user.bio && <p className="text-sm text-gray-600">{user.bio}</p>}

        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <Info
            label="Presupuesto"
            value={formatMoney(user.budget)}
            icon={<EuroIcon width={14} height={14} />}
          />
          <Info
            label="Entrada"
            value={formatDate(user.moveInDate)}
            icon={<CalendarIcon width={14} height={14} />}
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="chip bg-gray-100 text-gray-600">
            Convivencia {user.preferences.lifestylePreference}
          </span>
          <span className="chip bg-gray-100 text-gray-600">
            {user.preferences.smoking ? 'Fumador/a' : 'No fumador/a'}
          </span>
          {user.preferences.remoteWork && (
            <span className="chip bg-gray-100 text-gray-600">Teletrabajo</span>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <ProfileLevelBadge user={user} size="sm" />
          {user.instagramConnected && <TrustBadge kind="instagram" />}
          {user.linkedinConnected && <TrustBadge kind="linkedin" />}
          {user.referencesCount > 0 && (
            <TrustBadge kind="has-references" label={`${user.referencesCount} referencias`} />
          )}
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

function Info({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg bg-gray-50 px-2.5 py-1.5">
      <div className="text-[11px] text-gray-400 flex items-center gap-1">
        {icon}
        {label}
      </div>
      <div className="font-medium text-gray-700">{value}</div>
    </div>
  );
}
