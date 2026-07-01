import { initials } from '@/utils/formatting';

interface Props {
  name: string;
  photoUrl?: string;
  size?: number;
  className?: string;
}

export function Avatar({ name, photoUrl, size = 40, className = '' }: Props) {
  const style = { width: size, height: size };
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        style={style}
        className={`rounded-full object-cover bg-gray-100 ${className}`}
      />
    );
  }
  return (
    <div
      style={style}
      className={`rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold ${className}`}
    >
      {initials(name)}
    </div>
  );
}
