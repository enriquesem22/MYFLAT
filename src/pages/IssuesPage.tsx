import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { IssueList } from '@/components/issues/IssueList';
import { EmptyState } from '@/components/common/EmptyState';
import { Avatar } from '@/components/common/Avatar';
import { ChevronLeft, PlusIcon, WrenchIcon, XIcon } from '@/components/common/icons';
import { useAppStore } from '@/store/useAppStore';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useMyFlat } from '@/hooks/useMyFlat';
import { timeAgo } from '@/utils/formatting';
import type { Issue, IssueStatus } from '@/types';

const STATUSES: IssueStatus[] = [
  'nueva',
  'en revisión',
  'técnico avisado',
  'programada',
  'resuelta',
  'rechazada',
  'disputa',
];

export function IssuesPage() {
  const navigate = useNavigate();
  const me = useCurrentUser()!;
  const { property, isOwner } = useMyFlat();
  const issues = useAppStore((s) =>
    s.issues
      .filter((i) => i.propertyId === property?.id)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
  );
  const [selected, setSelected] = useState<Issue | null>(null);

  return (
    <AppLayout hideHeader>
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-100 px-2 h-14 flex items-center gap-2">
        <button onClick={() => navigate('/my-flat')} className="p-2 text-gray-500">
          <ChevronLeft width={22} height={22} />
        </button>
        <h1 className="text-lg font-bold text-gray-900 flex-1">Incidencias</h1>
        {property && (
          <button onClick={() => navigate('/my-flat/issues/new')} className="text-brand-500">
            <PlusIcon width={22} height={22} />
          </button>
        )}
      </header>

      <div className="p-4">
        {!property ? (
          <EmptyState
            icon={<WrenchIcon width={28} height={28} />}
            title="Sin piso asignado"
            description="Cuando entres en un piso podrás reportar y seguir incidencias aquí."
          />
        ) : issues.length === 0 ? (
          <EmptyState
            icon={<WrenchIcon width={28} height={28} />}
            title="No hay incidencias abiertas"
            description="Si algo se estropea (lavadora, internet, humedad…), repórtalo y quedará registrado."
            action={
              <button className="btn-primary" onClick={() => navigate('/my-flat/issues/new')}>
                Reportar problema
              </button>
            }
          />
        ) : (
          <>
            <button
              onClick={() => navigate('/my-flat/issues/new')}
              className="btn-primary w-full mb-4"
            >
              <WrenchIcon width={18} height={18} /> Reportar problema
            </button>
            <IssueList issues={issues} onSelect={setSelected} />
          </>
        )}
      </div>

      {selected && (
        <IssueDetail
          issue={issues.find((i) => i.id === selected.id) ?? selected}
          canManage={isOwner}
          meId={me.id}
          statuses={STATUSES}
          onClose={() => setSelected(null)}
        />
      )}
    </AppLayout>
  );
}

function IssueDetail({
  issue,
  canManage,
  meId,
  statuses,
  onClose,
}: {
  issue: Issue;
  canManage: boolean;
  meId: string;
  statuses: IssueStatus[];
  onClose: () => void;
}) {
  const updateIssueStatus = useAppStore((s) => s.updateIssueStatus);
  const addIssueComment = useAppStore((s) => s.addIssueComment);
  const getUser = useAppStore((s) => s.getUser);
  const [comment, setComment] = useState('');

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">{issue.title}</h2>
          <button onClick={onClose} className="text-gray-400">
            <XIcon width={22} height={22} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex flex-wrap gap-1.5">
            <span className="chip bg-gray-100 text-gray-600">{issue.category}</span>
            <span className="chip bg-amber-50 text-amber-600 capitalize">
              Urgencia {issue.urgency}
            </span>
            <span className="chip bg-brand-50 text-brand-600">{issue.status}</span>
          </div>

          <p className="text-sm text-gray-700">{issue.description}</p>
          {issue.photoUrl && (
            <div className="text-xs text-gray-400">Foto adjunta: {issue.photoUrl}</div>
          )}

          {/* Cambiar estado (propietario) */}
          {canManage && (
            <div>
              <label className="label">Cambiar estado</label>
              <div className="flex flex-wrap gap-1.5">
                {statuses.map((st) => (
                  <button
                    key={st}
                    onClick={() => updateIssueStatus(issue.id, st)}
                    className={`chip border ${
                      issue.status === st
                        ? 'bg-brand-500 text-white border-brand-500'
                        : 'bg-white text-gray-600 border-gray-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Marcar resuelta (ambos) */}
          {issue.status !== 'resuelta' && (
            <button
              className="btn-secondary w-full"
              onClick={() => updateIssueStatus(issue.id, 'resuelta')}
            >
              Marcar como resuelta
            </button>
          )}

          {/* Historial de comentarios */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Historial</h3>
            <div className="space-y-3">
              {issue.comments.length === 0 && (
                <p className="text-sm text-gray-400">Sin comentarios todavía.</p>
              )}
              {issue.comments.map((c) => {
                const author = getUser(c.userId);
                return (
                  <div key={c.id} className="flex gap-2">
                    <Avatar name={author?.name ?? '?'} photoUrl={author?.photoUrl} size={30} />
                    <div className="flex-1">
                      <div className="text-xs text-gray-400">
                        {author?.name} · {timeAgo(c.createdAt)}
                      </div>
                      <div className="text-sm text-gray-700">{c.text}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Añadir comentario */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!comment.trim()) return;
              addIssueComment(issue.id, comment);
              setComment('');
            }}
            className="flex gap-2"
          >
            <input
              className="input flex-1"
              placeholder="Añadir comentario…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button className="btn-primary px-4" disabled={!comment.trim()}>
              Enviar
            </button>
          </form>
          <p className="text-[11px] text-gray-400 text-center">
            Creada por {getUser(issue.createdBy)?.name ?? 'un usuario'} · {timeAgo(issue.createdAt)}
            {meId === issue.createdBy ? ' (tú)' : ''}
          </p>
        </div>
      </div>
    </div>
  );
}
