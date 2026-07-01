import type { ProfileLevel, User } from '@/types';

// Reglas del nivel de perfil (sistema de confianza de Myflat):
//  - basic:       solo email registrado.
//  - social:      ha conectado Instagram o LinkedIn.
//  - verified:    ha verificado identidad (DNI/selfie simulado).
//  - recommended: identidad verificada + al menos 2 referencias.
export function getProfileLevel(user: {
  instagramConnected: boolean;
  linkedinConnected: boolean;
  identityVerified: boolean;
  referencesCount: number;
}): ProfileLevel {
  if (user.identityVerified && user.referencesCount >= 2) return 'recommended';
  if (user.identityVerified) return 'verified';
  if (user.instagramConnected || user.linkedinConnected) return 'social';
  return 'basic';
}

export interface ProfileLevelMeta {
  level: ProfileLevel;
  label: string;
  color: string; // clase de color de texto Tailwind
  bg: string; // clase de fondo suave Tailwind
  description: string;
}

export const PROFILE_LEVEL_META: Record<ProfileLevel, ProfileLevelMeta> = {
  basic: {
    level: 'basic',
    label: 'Perfil básico',
    color: 'text-gray-500',
    bg: 'bg-gray-100',
    description: 'Cuenta registrada con email.',
  },
  social: {
    level: 'social',
    label: 'Perfil social',
    color: 'text-brand-600',
    bg: 'bg-brand-50',
    description: 'Ha conectado Instagram o LinkedIn.',
  },
  verified: {
    level: 'verified',
    label: 'Identidad verificada',
    color: 'text-gold-600',
    bg: 'bg-amber-50',
    description: 'Identidad verificada con documento y selfie.',
  },
  recommended: {
    level: 'recommended',
    label: 'Recomendado',
    color: 'text-gold-600',
    bg: 'bg-amber-50',
    description: 'Identidad verificada y con referencias.',
  },
};

export interface ProfileTask {
  key: string;
  label: string;
  done: boolean;
}

/** Tareas de completado de perfil con su barra de progreso. */
export function getProfileTasks(user: User): ProfileTask[] {
  return [
    { key: 'photo', label: 'Añade foto', done: Boolean(user.photoUrl) },
    { key: 'bio', label: 'Escribe una descripción', done: Boolean(user.bio) },
    { key: 'phone', label: 'Verifica teléfono', done: user.phoneVerified },
    { key: 'instagram', label: 'Conecta Instagram', done: user.instagramConnected },
    { key: 'linkedin', label: 'Conecta LinkedIn', done: user.linkedinConnected },
    { key: 'identity', label: 'Verifica identidad', done: user.identityVerified },
    { key: 'references', label: 'Pide una referencia', done: user.referencesCount >= 1 },
    {
      key: 'preferences',
      label: 'Añade preferencias de convivencia',
      done: Boolean(user.preferences),
    },
  ];
}

export function getProfileCompletion(user: User): number {
  const tasks = getProfileTasks(user);
  const done = tasks.filter((t) => t.done).length;
  return Math.round((done / tasks.length) * 100);
}
