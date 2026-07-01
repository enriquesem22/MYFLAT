import type { Issue } from '@/types';
import { IssueCard } from './IssueCard';

interface Props {
  issues: Issue[];
  onSelect: (issue: Issue) => void;
}

export function IssueList({ issues, onSelect }: Props) {
  return (
    <div className="space-y-3">
      {issues.map((issue) => (
        <IssueCard key={issue.id} issue={issue} onClick={() => onSelect(issue)} />
      ))}
    </div>
  );
}
