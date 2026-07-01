import { useAppStore } from '@/store/useAppStore';
import { useCurrentUser } from './useCurrentUser';
import type { Property } from '@/types';

interface MyFlatInfo {
  /** Piso principal del usuario (donde vive o su primer anuncio). */
  property: Property | null;
  /** Todos los pisos relevantes (varios si es propietario). */
  properties: Property[];
  isOwner: boolean;
}

// Resuelve el/los piso(s) asociados al usuario:
//  - Propietario: sus anuncios.
//  - Inquilino/compañero: el piso donde tiene pagos (vive allí).
export function useMyFlat(): MyFlatInfo {
  const me = useCurrentUser();
  const properties = useAppStore((s) => s.properties);
  const payments = useAppStore((s) => s.payments);

  if (!me) return { property: null, properties: [], isOwner: false };

  if (me.role === 'owner') {
    const owned = properties.filter((p) => p.ownerId === me.id);
    return { property: owned[0] ?? null, properties: owned, isOwner: true };
  }

  const tenantPropIds = new Set(
    payments.filter((p) => p.tenantId === me.id).map((p) => p.propertyId),
  );
  const flats = properties.filter((p) => tenantPropIds.has(p.id));
  return { property: flats[0] ?? null, properties: flats, isOwner: false };
}
