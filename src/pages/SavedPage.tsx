import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { EmptyState } from '@/components/common/EmptyState';
import { Avatar } from '@/components/common/Avatar';
import { BookmarkIcon, ChevronLeft, HeartIcon, XIcon } from '@/components/common/icons';
import { useAppStore } from '@/store/useAppStore';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { formatMoney } from '@/utils/formatting';

// Sección "Guardados": los pisos y personas marcados con el botón guardar
// desde Descubrir. Permite abrir el perfil, quitar de guardados y dar
// "me interesa" si aún no se ha hecho.
export function SavedPage() {
  const navigate = useNavigate();
  const me = useCurrentUser()!;
  const likes = useAppStore((s) => s.likes);
  const properties = useAppStore((s) => s.properties);
  const getUser = useAppStore((s) => s.getUser);
  const unsave = useAppStore((s) => s.unsave);
  const swipe = useAppStore((s) => s.swipe);
  const [toast, setToast] = useState('');

  const saved = useMemo(
    () =>
      likes
        .filter((l) => l.fromUserId === me.id && l.direction === 'save')
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [likes, me.id],
  );

  const alreadyLiked = (targetId: string) =>
    likes.some((l) => l.fromUserId === me.id && l.targetId === targetId && l.direction === 'like');

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  }

  function like(targetType: 'property' | 'user', targetId: string) {
    const m = swipe(targetType, targetId, 'like');
    unsave(targetId); // sale de guardados al mostrar interés
    if (m) navigate(`/matches/${m.id}`);
    else notify('¡Marcado como me interesa!');
  }

  return (
    <AppLayout hideHeader>
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-100 px-2 h-14 flex items-center gap-2">
        <button onClick={() => navigate('/discover')} className="p-2 text-gray-500">
          <ChevronLeft width={22} height={22} />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Guardados</h1>
      </header>

      <div className="p-4">
        {saved.length === 0 ? (
          <EmptyState
            icon={<BookmarkIcon width={28} height={28} />}
            title="Aún no has guardado nada"
            description="Usa el botón de guardar en Descubrir para revisar pisos o personas más tarde."
            action={
              <button className="btn-primary" onClick={() => navigate('/discover')}>
                Ir a descubrir
              </button>
            }
          />
        ) : (
          <div className="space-y-3">
            {saved.map((l) => {
              if (l.targetType === 'property') {
                const p = properties.find((pr) => pr.id === l.targetId);
                if (!p) return null;
                const photo = p.photos.find((ph) => ph.isMain)?.url ?? p.photos[0]?.url;
                return (
                  <SavedRow
                    key={l.id}
                    title={p.title}
                    subtitle={`${p.neighborhood}, ${p.city} · ${formatMoney(p.price)}/mes`}
                    photo={photo}
                    liked={alreadyLiked(p.id)}
                    onOpen={() => navigate(`/properties/${p.id}`)}
                    onRemove={() => unsave(p.id)}
                    onLike={() => like('property', p.id)}
                  />
                );
              }
              const u = getUser(l.targetId);
              if (!u) return null;
              return (
                <SavedRow
                  key={l.id}
                  title={`${u.name}, ${u.age}`}
                  subtitle={`${u.city} · ${u.profession}`}
                  photo={u.photoUrl}
                  liked={alreadyLiked(u.id)}
                  onOpen={() => navigate(`/users/${u.id}`)}
                  onRemove={() => unsave(u.id)}
                  onLike={() => like('user', u.id)}
                />
              );
            })}
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-24 inset-x-0 flex justify-center z-50 pointer-events-none">
          <div className="bg-gray-900 text-white text-sm px-4 py-2 rounded-full shadow-lg">
            {toast}
          </div>
        </div>
      )}
    </AppLayout>
  );
}

function SavedRow({
  title,
  subtitle,
  photo,
  liked,
  onOpen,
  onRemove,
  onLike,
}: {
  title: string;
  subtitle: string;
  photo?: string;
  liked: boolean;
  onOpen: () => void;
  onRemove: () => void;
  onLike: () => void;
}) {
  return (
    <div className="card p-3 flex items-center gap-3">
      <button onClick={onOpen} className="flex items-center gap-3 flex-1 min-w-0 text-left">
        <Avatar name={title} photoUrl={photo} size={52} />
        <div className="min-w-0">
          <div className="font-semibold text-gray-900 truncate">{title}</div>
          <div className="text-sm text-gray-500 truncate">{subtitle}</div>
        </div>
      </button>
      <div className="flex items-center gap-2 shrink-0">
        <button
          aria-label="Quitar de guardados"
          onClick={onRemove}
          className="w-9 h-9 rounded-full bg-white border border-gray-200 text-gray-400 flex items-center justify-center hover:bg-gray-50"
        >
          <XIcon width={18} height={18} />
        </button>
        {liked ? (
          <span className="chip bg-emerald-50 text-emerald-600">Te interesa ✓</span>
        ) : (
          <button
            aria-label="Me interesa"
            onClick={onLike}
            className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600"
          >
            <HeartIcon width={18} height={18} />
          </button>
        )}
      </div>
    </div>
  );
}
