import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ChatView } from '@/components/matches/ChatView';
import { Avatar } from '@/components/common/Avatar';
import { ChevronLeft } from '@/components/common/icons';
import { useAppStore } from '@/store/useAppStore';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export function ChatPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const me = useCurrentUser()!;
  const match = useAppStore((s) => s.matches.find((m) => m.id === id));
  const messages = useAppStore((s) => s.messages.filter((m) => m.matchId === id));
  const getUser = useAppStore((s) => s.getUser);
  const properties = useAppStore((s) => s.properties);
  const sendMessage = useAppStore((s) => s.sendMessage);

  if (!match) return <Navigate to="/matches" replace />;

  const otherId = match.userAId === me.id ? match.userBId : match.userAId;
  const other = getUser(otherId);
  const property = match.propertyId ? properties.find((p) => p.id === match.propertyId) : undefined;
  const title = other?.name ?? 'Chat';
  const subtitle = property ? property.title : 'Match en Myflat';

  const sorted = [...messages].sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return (
    <AppLayout hideNav hideHeader>
      <div className="flex flex-col h-screen">
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-100 px-2 h-14 flex items-center gap-2">
          <button onClick={() => navigate('/matches')} className="p-2 text-gray-500">
            <ChevronLeft width={22} height={22} />
          </button>
          <button
            className="flex items-center gap-2 flex-1 text-left"
            onClick={() => other && navigate(`/users/${other.id}`)}
          >
            <Avatar name={title} photoUrl={other?.photoUrl} size={38} />
            <div className="min-w-0">
              <div className="font-semibold text-gray-900 leading-tight truncate">{title}</div>
              <div className="text-xs text-gray-400 truncate">{subtitle}</div>
            </div>
          </button>
          {property && (
            <button
              onClick={() => navigate(`/properties/${property.id}`)}
              className="text-xs text-brand-500 font-semibold px-2"
            >
              Ver piso
            </button>
          )}
        </header>

        <div className="flex-1 overflow-hidden bg-gray-50">
          <ChatView messages={sorted} meId={me.id} onSend={(text) => sendMessage(match.id, text)} />
        </div>
      </div>
    </AppLayout>
  );
}
