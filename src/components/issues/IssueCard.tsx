import type { Issue, IssueStatus, IssueUrgency } from '@/types';
import { timeAgo } from '@/utils/formatting';

const URGENCY: Record<IssueUrgency, string> = {
  baja: 'bg-gray-100 text-gray-600',
  media: 'bg-amber-50 text-amber-600',
  alta: 'bg-red-50 text-red-600',
};

const STATUS: Record<IssueStatus, string> = {
  nueva: 'bg-brand-50 text-brand-600',
  'en revisión': 'bg-amber-50 text-amber-600',
  'técnico avisado': 'bg-amber-50 text-amber-600',
  programada: 'bg-brand-50 text-brand-600',
  resuelta: 'bg-emerald-50 text-emerald-600',
  rechazada: 'bg-gray-100 text-gray-500',
  disputa: 'bg-red-50 text-red-600',
};

interface Props {
  issue: Issue;
  onClick?: () => void;
}

export function IssueCard({ issue, onClick }: Props) {
  const lastComment = issue.comments[issue.comments.length - 1];
  return (
    <button onClick={onClick} className="card p-4 w-full text-left hover:bg-gray-50">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900">{issue.title}</span>
            <span className={`chip ${URGENCY[issue.urgency]}`}>{issue.urgency}</span>
          </div>
          <div className="text-xs text-gray-400 mt-0.5">
            {issue.category} · {timeAgo(issue.updatedAt)}
          </div>
        </div>
        <span className={`chip ${STATUS[issue.status]}`}>{issue.status}</span>
      </div>
      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{issue.description}</p>
      {lastComment && (
        <p className="text-xs text-gray-400 mt-2 italic">Última: “{lastComment.text}”</p>
      )}
    </button>
  );
}
