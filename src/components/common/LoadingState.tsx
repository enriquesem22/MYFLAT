interface Props {
  label?: string;
}

export function LoadingState({ label = 'Cargando…' }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <div className="w-8 h-8 border-2 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
      <p className="mt-3 text-sm">{label}</p>
    </div>
  );
}
