import { useRef, useState, type ReactNode } from 'react';

interface Props {
  /** Render del contenido; recibe el índice de foto actual. */
  render: (photoIndex: number) => ReactNode;
  /** Se llama al soltar la tarjeta arrastrada más allá del umbral. */
  onSwipe: (direction: 'left' | 'right') => void;
  /** Se llama al tocar la tarjeta (sin arrastrar) fuera de las zonas de foto. */
  onOpen: () => void;
  active: boolean;
  /** Nº de fotos, para permitir navegar tocando los lados. */
  photoCount?: number;
}

// Tarjeta arrastrable estilo Tinder.
//  - Arrastrar a izquierda/derecha = descartar / me interesa.
//  - Tocar (sin arrastrar): en la mitad superior (foto), los lados cambian de
//    foto y el centro abre el perfil; en la mitad inferior, abre el perfil.
export function SwipeCard({ render, onSwipe, onOpen, active, photoCount = 1 }: Props) {
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const startX = useRef(0);
  const startY = useRef(0);
  const moved = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const THRESHOLD = 110;

  function onPointerDown(e: React.PointerEvent) {
    if (!active) return;
    setDragging(true);
    moved.current = false;
    startX.current = e.clientX;
    startY.current = e.clientY;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    const delta = e.clientX - startX.current;
    if (Math.abs(delta) > 8 || Math.abs(e.clientY - startY.current) > 8) {
      moved.current = true;
    }
    setDx(delta);
  }

  function onPointerUp(e: React.PointerEvent) {
    if (!dragging) return;
    setDragging(false);

    if (!moved.current) {
      handleTap(e.clientX, e.clientY);
      setDx(0);
      return;
    }
    if (dx > THRESHOLD) onSwipe('right');
    else if (dx < -THRESHOLD) onSwipe('left');
    setDx(0);
  }

  function handleTap(clientX: number, clientY: number) {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) {
      onOpen();
      return;
    }
    const relX = (clientX - rect.left) / rect.width;
    const relY = (clientY - rect.top) / rect.height;
    // Mitad superior = zona de foto.
    if (relY < 0.55 && photoCount > 1) {
      if (relX < 0.33) {
        setPhotoIndex((i) => Math.max(0, i - 1));
        return;
      }
      if (relX > 0.67) {
        setPhotoIndex((i) => Math.min(photoCount - 1, i + 1));
        return;
      }
    }
    onOpen();
  }

  const rotate = dx / 18;
  const likeOpacity = Math.min(Math.max(dx / THRESHOLD, 0), 1);
  const nopeOpacity = Math.min(Math.max(-dx / THRESHOLD, 0), 1);

  return (
    <div
      ref={cardRef}
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
        {render(photoIndex)}

        {/* Sellos ME INTERESA / NO ENCAJA */}
        <div
          className="absolute top-6 left-5 rotate-[-12deg] border-4 border-emerald-500 text-emerald-500 font-extrabold text-2xl px-3 py-1 rounded-lg pointer-events-none"
          style={{ opacity: likeOpacity }}
        >
          ME INTERESA
        </div>
        <div
          className="absolute top-6 right-5 rotate-[12deg] border-4 border-red-500 text-red-500 font-extrabold text-2xl px-3 py-1 rounded-lg pointer-events-none"
          style={{ opacity: nopeOpacity }}
        >
          NO ENCAJA
        </div>
      </div>
    </div>
  );
}
