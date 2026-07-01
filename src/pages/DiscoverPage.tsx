import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { SwipeDeck } from '@/components/swipe/SwipeDeck';
import { PropertyCard } from '@/components/cards/PropertyCard';
import { UserCard } from '@/components/cards/UserCard';
import { EmptyState } from '@/components/common/EmptyState';
import { HeartIcon, SettingsIcon } from '@/components/common/icons';
import { useAppStore } from '@/store/useAppStore';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import {
  calculateUserPropertyCompatibility,
  calculateUserUserCompatibility,
} from '@/utils/compatibility';
import type { LikeDirection, Match, Property, User } from '@/types';
import { Avatar } from '@/components/common/Avatar';

export function DiscoverPage() {
  const navigate = useNavigate();
  const me = useCurrentUser()!;
  const properties = useAppStore((s) => s.properties);
  const users = useAppStore((s) => s.users);
  const likes = useAppStore((s) => s.likes);
  const swipe = useAppStore((s) => s.swipe);

  const [newMatch, setNewMatch] = useState<Match | null>(null);

  // Los que buscan habitación ven pisos; compañeros y propietarios ven personas.
  const mode: 'properties' | 'users' = me.role === 'seeker_room' ? 'properties' : 'users';

  // Excluir lo ya decidido (like/dislike/save).
  const decidedIds = useMemo(
    () => new Set(likes.filter((l) => l.fromUserId === me.id).map((l) => l.targetId)),
    [likes, me.id],
  );

  const propertyItems = useMemo(
    () =>
      properties
        .filter((p) => p.ownerId !== me.id && !decidedIds.has(p.id))
        .map((p) => ({ property: p, compat: calculateUserPropertyCompatibility(me, p) }))
        .sort((a, b) => b.compat.score - a.compat.score),
    [properties, me, decidedIds],
  );

  const userItems = useMemo(() => {
    // Un propietario ve seekers; un seeker de compañero ve otros seekers.
    // Tanto propietarios como quienes buscan compañero ven candidatos (no owners).
    const pool = users.filter(
      (u) => u.id !== me.id && !decidedIds.has(u.id) && u.role !== 'owner',
    );
    return pool
      .map((u) => ({ user: u, compat: calculateUserUserCompatibility(me, u) }))
      .sort((a, b) => b.compat.score - a.compat.score);
  }, [users, me, decidedIds]);

  function handleProperty(item: { property: Property }, dir: LikeDirection) {
    const match = swipe('property', item.property.id, dir);
    if (match) setNewMatch(match);
  }

  function handleUser(item: { user: User }, dir: LikeDirection) {
    const match = swipe('user', item.user.id, dir);
    if (match) setNewMatch(match);
  }

  return (
    <AppLayout
      title="Descubrir"
      headerRight={
        <button onClick={() => navigate('/settings')} className="text-gray-400 hover:text-gray-600">
          <SettingsIcon width={22} height={22} />
        </button>
      }
    >
      {mode === 'properties' ? (
        <SwipeDeck
          items={propertyItems}
          keyOf={(i) => i.property.id}
          renderCard={(i) => <PropertyCard property={i.property} compatibility={i.compat} />}
          onDecision={handleProperty}
          emptyState={
            <EmptyState
              icon={<HeartIcon width={28} height={28} />}
              title="No hay más habitaciones por ahora"
              description="Vuelve más tarde o revisa tus matches. Cada día se publican pisos nuevos."
              action={
                <button className="btn-primary" onClick={() => navigate('/matches')}>
                  Ver mis matches
                </button>
              }
            />
          }
        />
      ) : (
        <SwipeDeck
          items={userItems}
          keyOf={(i) => i.user.id}
          renderCard={(i) => <UserCard user={i.user} compatibility={i.compat} />}
          onDecision={handleUser}
          emptyState={
            <EmptyState
              icon={<HeartIcon width={28} height={28} />}
              title="No hay más candidatos por ahora"
              description="Vuelve más tarde. Seguimos buscando personas compatibles contigo."
              action={
                <button className="btn-primary" onClick={() => navigate('/matches')}>
                  Ver mis matches
                </button>
              }
            />
          }
        />
      )}

      {newMatch && <MatchOverlay match={newMatch} onClose={() => setNewMatch(null)} />}
    </AppLayout>
  );
}

function MatchOverlay({ match, onClose }: { match: Match; onClose: () => void }) {
  const navigate = useNavigate();
  const me = useCurrentUser()!;
  const getUser = useAppStore((s) => s.getUser);
  const otherId = match.userAId === me.id ? match.userBId : match.userAId;
  const other = getUser(otherId);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center">
        <div className="flex justify-center -space-x-3 mb-4">
          <Avatar name={me.name} photoUrl={me.photoUrl} size={72} className="ring-4 ring-white" />
          <Avatar
            name={other?.name ?? '?'}
            photoUrl={other?.photoUrl}
            size={72}
            className="ring-4 ring-white"
          />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900">¡Es un match! 🎉</h2>
        <p className="text-gray-500 mt-1">
          Ya podéis hablar{other ? ` con ${other.name}` : ''} y organizar una visita.
        </p>
        <div className="mt-6 space-y-2">
          <button
            className="btn-primary w-full"
            onClick={() => navigate(`/matches/${match.id}`)}
          >
            Enviar mensaje
          </button>
          <button className="btn-ghost w-full" onClick={onClose}>
            Seguir descubriendo
          </button>
        </div>
      </div>
    </div>
  );
}
