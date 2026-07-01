import { PROFILE_LEVEL_META, getProfileLevel } from '@/utils/profileLevel';
import { ShieldIcon, StarIcon } from '@/components/common/icons';

interface Props {
  user: {
    instagramConnected: boolean;
    linkedinConnected: boolean;
    identityVerified: boolean;
    referencesCount: number;
  };
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

// Icono + etiqueta según el nivel de confianza del perfil:
//  - basic: sin icono especial (punto gris)
//  - social: escudo azul
//  - verified: escudo dorado
//  - recommended: escudo dorado + estrella
export function ProfileLevelBadge({ user, showLabel = true, size = 'md' }: Props) {
  const level = getProfileLevel(user);
  const meta = PROFILE_LEVEL_META[level];
  const iconSize = size === 'sm' ? 13 : 15;

  const icon =
    level === 'basic' ? (
      <span className="w-2 h-2 rounded-full bg-gray-300" />
    ) : level === 'social' ? (
      <ShieldIcon width={iconSize} height={iconSize} className="text-brand-500" />
    ) : level === 'verified' ? (
      <ShieldIcon width={iconSize} height={iconSize} className="text-gold-500" />
    ) : (
      <span className="flex items-center">
        <ShieldIcon width={iconSize} height={iconSize} className="text-gold-500" />
        <StarIcon width={iconSize - 3} height={iconSize - 3} className="text-gold-500 -ml-1" />
      </span>
    );

  if (!showLabel) return <span title={meta.label}>{icon}</span>;

  return (
    <span className={`chip ${meta.bg} ${meta.color}`}>
      {icon}
      {meta.label}
    </span>
  );
}
