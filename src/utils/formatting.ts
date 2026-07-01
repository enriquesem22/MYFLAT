// Utilidades de formato reutilizables (dinero, fechas, etiquetas legibles).

const eur = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

export function formatMoney(amount: number): string {
  return eur.format(amount);
}

/** "1 agosto 2026" a partir de una fecha ISO. */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** "1 ago" formato corto. */
export function formatDateShort(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

/** Diferencia relativa amistosa ("hace 3 h", "ayer"). */
export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const min = Math.round(diff / 60000);
  if (min < 1) return 'ahora';
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.round(h / 24);
  if (d === 1) return 'ayer';
  if (d < 7) return `hace ${d} días`;
  return formatDateShort(iso);
}

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export const ROLE_LABELS: Record<string, string> = {
  seeker_room: 'Busca habitación',
  seeker_roommate: 'Busca compañero',
  owner: 'Propietario',
};
