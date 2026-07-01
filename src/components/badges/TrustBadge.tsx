import type { ReactNode } from 'react';
import {
  CameraIcon,
  CheckIcon,
  InstagramIcon,
  LinkedinIcon,
  ShieldIcon,
  StarIcon,
} from '@/components/common/icons';

export type TrustBadgeKind =
  | 'verified-owner'
  | 'verified-property'
  | 'has-video'
  | 'has-references'
  | 'basic'
  | 'social'
  | 'identity'
  | 'instagram'
  | 'linkedin'
  | 'recommended';

interface BadgeConfig {
  label: string;
  icon: ReactNode;
  className: string;
}

const CONFIG: Record<TrustBadgeKind, BadgeConfig> = {
  'verified-owner': {
    label: 'Casero verificado',
    icon: <ShieldIcon width={13} height={13} />,
    className: 'bg-amber-50 text-gold-600',
  },
  'verified-property': {
    label: 'Propiedad verificada',
    icon: <CheckIcon width={13} height={13} />,
    className: 'bg-emerald-50 text-emerald-600',
  },
  'has-video': {
    label: 'Piso con vídeo',
    icon: <CameraIcon width={13} height={13} />,
    className: 'bg-brand-50 text-brand-600',
  },
  'has-references': {
    label: 'Referencias',
    icon: <StarIcon width={12} height={12} />,
    className: 'bg-amber-50 text-gold-600',
  },
  basic: {
    label: 'Perfil básico',
    icon: <CheckIcon width={13} height={13} />,
    className: 'bg-gray-100 text-gray-500',
  },
  social: {
    label: 'Perfil social',
    icon: <CheckIcon width={13} height={13} />,
    className: 'bg-brand-50 text-brand-600',
  },
  identity: {
    label: 'Identidad verificada',
    icon: <ShieldIcon width={13} height={13} />,
    className: 'bg-amber-50 text-gold-600',
  },
  instagram: {
    label: 'Instagram conectado',
    icon: <InstagramIcon width={13} height={13} />,
    className: 'bg-brand-50 text-brand-600',
  },
  linkedin: {
    label: 'LinkedIn conectado',
    icon: <LinkedinIcon width={13} height={13} />,
    className: 'bg-brand-50 text-brand-600',
  },
  recommended: {
    label: 'Recomendado',
    icon: <StarIcon width={12} height={12} />,
    className: 'bg-amber-50 text-gold-600',
  },
};

interface Props {
  kind: TrustBadgeKind;
  label?: string; // permite sobreescribir el texto
}

export function TrustBadge({ kind, label }: Props) {
  const cfg = CONFIG[kind];
  return (
    <span className={`chip ${cfg.className}`}>
      {cfg.icon}
      {label ?? cfg.label}
    </span>
  );
}
