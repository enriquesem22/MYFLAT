import type { User } from '@/types';
import { getProfileCompletion, getProfileTasks } from '@/utils/profileLevel';
import { CheckIcon } from '@/components/common/icons';

interface Props {
  user: User;
  onTaskClick?: (key: string) => void;
}

// Barra de progreso "Tu perfil está al 45%" + lista de tareas para mejorarlo.
export function ProfileCompletion({ user, onTaskClick }: Props) {
  const pct = getProfileCompletion(user);
  const tasks = getProfileTasks(user);
  const pending = tasks.filter((t) => !t.done);

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-gray-900">Tu perfil está al {pct}%</span>
        <span className="text-sm text-gray-400">
          {tasks.filter((t) => t.done).length}/{tasks.length}
        </span>
      </div>
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden mt-2">
        <div
          className="h-full rounded-full bg-brand-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      {pending.length > 0 ? (
        <>
          <p className="text-sm text-gray-500 mt-3 mb-2">Para mejorarlo:</p>
          <div className="space-y-1.5">
            {pending.map((t) => (
              <button
                key={t.key}
                onClick={() => onTaskClick?.(t.key)}
                className="w-full flex items-center gap-2 text-left text-sm text-gray-700 rounded-lg px-2 py-1.5 hover:bg-gray-50"
              >
                <span className="w-5 h-5 rounded-full border-2 border-gray-200 shrink-0" />
                {t.label}
              </button>
            ))}
          </div>
        </>
      ) : (
        <p className="text-sm text-emerald-600 mt-3 flex items-center gap-1.5">
          <CheckIcon width={16} height={16} /> ¡Perfil completo! Apareces mejor posicionado.
        </p>
      )}
    </div>
  );
}
