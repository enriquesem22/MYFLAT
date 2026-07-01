import type { CompatibilityResult } from '@/utils/compatibility';

interface Props {
  result: CompatibilityResult;
  compact?: boolean;
}

function colorFor(score: number): string {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 60) return 'text-brand-600';
  if (score >= 40) return 'text-amber-600';
  return 'text-gray-500';
}

function barColorFor(score: number): string {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-brand-500';
  if (score >= 40) return 'bg-amber-500';
  return 'bg-gray-400';
}

/** Muestra "Compatibilidad: 87%" y, opcionalmente, el porqué. */
export function CompatibilityScore({ result, compact = false }: Props) {
  if (compact) {
    return (
      <span className={`text-sm font-semibold ${colorFor(result.score)}`}>
        {result.score}% compatible
      </span>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">Compatibilidad</span>
        <span className={`text-sm font-bold ${colorFor(result.score)}`}>
          {result.score}%
        </span>
      </div>
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full rounded-full ${barColorFor(result.score)} transition-all`}
          style={{ width: `${result.score}%` }}
        />
      </div>
      {result.reasons.length > 0 && (
        <ul className="mt-3 space-y-1">
          {result.reasons.map((r) => (
            <li key={r} className="text-xs text-gray-600 flex items-start gap-1.5">
              <span className="text-emerald-500 mt-0.5">✓</span>
              {r}
            </li>
          ))}
        </ul>
      )}
      {result.warnings.length > 0 && (
        <ul className="mt-1.5 space-y-1">
          {result.warnings.map((w) => (
            <li key={w} className="text-xs text-amber-600 flex items-start gap-1.5">
              <span className="mt-0.5">!</span>
              {w}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
