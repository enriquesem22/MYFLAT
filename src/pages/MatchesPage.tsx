import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { MatchList } from '@/components/matches/MatchList';
import { EmptyState } from '@/components/common/EmptyState';
import { ChatIcon } from '@/components/common/icons';
import { useAppStore } from '@/store/useAppStore';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export function MatchesPage() {
  const navigate = useNavigate();
  const me = useCurrentUser()!;
  const matches = useAppStore((s) => s.matches);
  const messages = useAppStore((s) => s.messages);
  const getUser = useAppStore((s) => s.getUser);
  const properties = useAppStore((s) => s.properties);

  const myMatches = useMemo(
    () =>
      matches
        .filter((m) => m.userAId === me.id || m.userBId === me.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [matches, me.id],
  );

  const lastMessageOf = (matchId: string) =>
    messages
      .filter((m) => m.matchId === matchId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];

  return (
    <AppLayout title="Matches">
      {myMatches.length === 0 ? (
        <EmptyState
          icon={<ChatIcon width={28} height={28} />}
          title="Aún no tienes matches"
          description="Da like a habitaciones o candidatos para empezar. Cuando haya interés mutuo, podréis hablar aquí."
          action={
            <button className="btn-primary" onClick={() => navigate('/discover')}>
              Ir a descubrir
            </button>
          }
        />
      ) : (
        <div className="card mx-3 mt-3 overflow-hidden">
          <MatchList
            matches={myMatches}
            meId={me.id}
            getUser={getUser}
            getProperty={(id) => properties.find((p) => p.id === id)}
            lastMessageOf={lastMessageOf}
          />
        </div>
      )}
    </AppLayout>
  );
}
