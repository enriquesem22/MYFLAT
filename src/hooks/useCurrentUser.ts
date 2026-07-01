import { useAppStore } from '@/store/useAppStore';
import type { User } from '@/types';

/** Devuelve el usuario con sesión iniciada (o null). */
export function useCurrentUser(): User | null {
  return useAppStore((s) => {
    if (!s.currentUserId) return null;
    return s.users.find((u) => u.id === s.currentUserId) ?? null;
  });
}
