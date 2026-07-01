import { useRef, useState, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Se llama al soltar la tarjeta arrastrada más allá del umbral. */
  onSwipe: (direction: 'left' | 'right') => void;
  active: boolean;
}

// Tarjeta arrastrable estilo Tinder. En pantallas táctiles o con ratón se puede
// arrastrar a izquierda/derecha; los botones del deck hacen lo mismo.
export function SwipeCard({ children, onSwipe, active }: Props) {
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const THRESHOLD = 110;

  function onPointerDown(e: React.PointerEvent) {
    if (!active) return;
    setDragging(true);
    startX.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    setDx(e.clientX - startX.current);
  }

  function onPointerUp() {
    if (!dragging) return;
    setDragging(false);
    if (dx > THRESHOLD) onSwipe('right');
    else if (dx < -THRESHOLD) onSwipe('left');
    setDx(0);
  }

  const rotate = dx / 18;
  const likeOpacity = Math.min(Math.max(dx / THRESHOLD, 0), 1);
  const nopeOpacity = Math.min(Math.max(-dx / THRESHOLD, 0), 1);

  return (
    <div
      className="absolute inset-0 select-none touch-none"
      style={{
        transform: `translateX(${dx}px) rotate(${rotate}deg)`,
        transition: dragging ? 'none' : 'transform 0.25s ease',
        cursor: active ? 'grab' : 'default',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div className="relative h-full w-full overflow-hidden rounded-3xl bg-white shadow-card border border-gray-100">
        {children}

        {/* Sellos ME INTERESA / NO ENCAJA */}
        <div
          className="absolute top-6 left-5 rotate-[-12deg] border-4 border-emerald-500 text-emerald-500 font-extrabold text-2xl px-3 py-1 rounded-lg"
          style={{ opacity: likeOpacity }}
        >
          ME INTERESA
        </div>
        <div
          className="absolute top-6 right-5 rotate-[12deg] border-4 border-red-500 text-red-500 font-extrabold text-2xl px-3 py-1 rounded-lg"
          style={{ opacity: nopeOpacity }}
        >
          NO ENCAJA
        </div>
      </div>
    </div>
  );
}
