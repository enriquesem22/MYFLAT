import { BookmarkIcon, HeartIcon, XIcon } from '@/components/common/icons';

interface Props {
  onDislike: () => void;
  onSave: () => void;
  onLike: () => void;
  saved?: boolean;
}

// Barra fija con las mismas acciones que el swipe (descartar / guardar / me
// interesa). Se usa dentro de los perfiles completos abiertos desde Descubrir.
export function SwipeActionsBar({ onDislike, onSave, onLike, saved = false }: Props) {
  return (
    <div className="sticky bottom-0 inset-x-0 z-20 bg-white/95 backdrop-blur border-t border-gray-100 px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
      <div className="flex items-center justify-center gap-5">
        <button
          aria-label="No encaja"
          onClick={onDislike}
          className="w-14 h-14 rounded-full bg-white border border-gray-200 shadow-sm text-red-500 flex items-center justify-center hover:bg-red-50 active:scale-95 transition"
        >
          <XIcon width={26} height={26} />
        </button>
        <button
          aria-label="Guardar"
          onClick={onSave}
          className={`w-12 h-12 rounded-full border shadow-sm flex items-center justify-center active:scale-95 transition ${
            saved
              ? 'bg-brand-500 border-brand-500 text-white'
              : 'bg-white border-gray-200 text-brand-500 hover:bg-brand-50'
          }`}
        >
          <BookmarkIcon width={22} height={22} />
        </button>
        <button
          aria-label="Me interesa"
          onClick={onLike}
          className="w-16 h-16 rounded-full bg-emerald-500 shadow-lg text-white flex items-center justify-center hover:bg-emerald-600 active:scale-95 transition"
        >
          <HeartIcon width={30} height={30} />
        </button>
      </div>
    </div>
  );
}
