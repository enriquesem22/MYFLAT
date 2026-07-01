import { useState, type ReactNode } from 'react';
import { SwipeCard } from './SwipeCard';
import { BookmarkIcon, HeartIcon, XIcon } from '@/components/common/icons';
import type { LikeDirection } from '@/types';

interface Props<T> {
  items: T[];
  keyOf: (item: T) => string;
  renderCard: (item: T) => ReactNode;
  onDecision: (item: T, direction: LikeDirection) => void;
  emptyState: ReactNode;
}

// Baraja de tarjetas: muestra la tarjeta superior y los botones de acción
// (descartar / guardar / me interesa). Al decidir, avanza a la siguiente.
export function SwipeDeck<T>({
  items,
  keyOf,
  renderCard,
  onDecision,
  emptyState,
}: Props<T>) {
  const [index, setIndex] = useState(0);
  const current = items[index];
  const next = items[index + 1];

  function decide(direction: LikeDirection) {
    if (!current) return;
    onDecision(current, direction);
    setIndex((i) => i + 1);
  }

  if (!current) return <>{emptyState}</>;

  return (
    <div className="flex flex-col items-center px-4 pt-4">
      <div className="relative w-full" style={{ height: 'min(70vh, 560px)' }}>
        {/* Tarjeta siguiente (fondo) */}
        {next && (
          <div className="absolute inset-0 scale-[0.96] translate-y-2 opacity-60">
            <div className="h-full w-full overflow-hidden rounded-3xl bg-white shadow-sm border border-gray-100">
              {renderCard(next)}
            </div>
          </div>
        )}
        {/* Tarjeta activa */}
        <SwipeCard
          key={keyOf(current)}
          active
          onSwipe={(dir) => decide(dir === 'right' ? 'like' : 'dislike')}
        >
          {renderCard(current)}
        </SwipeCard>
      </div>

      {/* Botones de acción */}
      <div className="flex items-center justify-center gap-5 mt-6">
        <button
          aria-label="No encaja"
          onClick={() => decide('dislike')}
          className="w-14 h-14 rounded-full bg-white border border-gray-200 shadow-sm text-red-500 flex items-center justify-center hover:bg-red-50 active:scale-95 transition"
        >
          <XIcon width={26} height={26} />
        </button>
        <button
          aria-label="Guardar"
          onClick={() => decide('save')}
          className="w-12 h-12 rounded-full bg-white border border-gray-200 shadow-sm text-brand-500 flex items-center justify-center hover:bg-brand-50 active:scale-95 transition"
        >
          <BookmarkIcon width={22} height={22} />
        </button>
        <button
          aria-label="Me interesa"
          onClick={() => decide('like')}
          className="w-16 h-16 rounded-full bg-emerald-500 shadow-lg text-white flex items-center justify-center hover:bg-emerald-600 active:scale-95 transition"
        >
          <HeartIcon width={30} height={30} />
        </button>
      </div>
      <p className="mt-3 text-xs text-gray-400">
        Desliza o pulsa · {items.length - index} por ver
      </p>
    </div>
  );
}
