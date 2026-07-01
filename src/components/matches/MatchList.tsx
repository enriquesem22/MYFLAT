import { useNavigate } from 'react-router-dom';
import type { Match, Message, Property, User } from '@/types';
import { Avatar } from '@/components/common/Avatar';
import { ProfileLevelBadge } from '@/components/badges/ProfileLevelBadge';
import { timeAgo } from '@/utils/formatting';

interface Props {
  matches: Match[];
  meId: string;
  getUser: (id: string) => User | undefined;
  getProperty: (id: string) => Property | undefined;
  lastMessageOf: (matchId: string) => Message | undefined;
}

export function MatchList({ matches, meId, getUser, getProperty, lastMessageOf }: Props) {
  const navigate = useNavigate();

  return (
    <ul className="divide-y divide-gray-100">
      {matches.map((m) => {
        const otherId = m.userAId === meId ? m.userBId : m.userAId;
        const other = getUser(otherId);
        const property = m.propertyId ? getProperty(m.propertyId) : undefined;
        const last = lastMessageOf(m.id);
        const title = property ? property.title : other?.name ?? 'Match';
        const photo = property
          ? property.photos.find((p) => p.isMain)?.url ?? property.photos[0]?.url
          : other?.photoUrl;

        return (
          <li key={m.id}>
            <button
              onClick={() => navigate(`/matches/${m.id}`)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left"
            >
              <Avatar name={title} photoUrl={photo} size={52} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-gray-900 truncate">{title}</span>
                  {other && <ProfileLevelBadge user={other} showLabel={false} size="sm" />}
                </div>
                <p className="text-sm text-gray-500 truncate">
                  {last ? last.text : property ? `Con ${other?.name}` : 'Decid quién escribe primero 👋'}
                </p>
              </div>
              {last && (
                <span className="text-[11px] text-gray-400 shrink-0">
                  {timeAgo(last.createdAt)}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
