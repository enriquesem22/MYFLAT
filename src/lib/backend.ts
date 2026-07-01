import { isSupabaseEnabled, supabase } from './supabase';
import type {
  FlatDocument,
  InventoryItem,
  Issue,
  Like,
  Match,
  Message,
  Payment,
  Property,
  Reference,
  ResidenceRequest,
  Review,
  User,
} from '@/types';

// Capa de acceso a datos. En modo Supabase lee/escribe en la base de datos;
// en modo demo no hace nada (las funciones son "no-op") y la app usa los datos
// locales como hasta ahora.

export interface RemoteData {
  users: User[];
  properties: Property[];
  likes: Like[];
  matches: Match[];
  messages: Message[];
  payments: Payment[];
  issues: Issue[];
  reviews: Review[];
  references: Reference[];
  documents: FlatDocument[];
  inventory: InventoryItem[];
  residenceRequests: ResidenceRequest[];
}

const TABLES = [
  'users',
  'properties',
  'likes',
  'matches',
  'messages',
  'payments',
  'issues',
  'reviews',
  'references',
  'documents',
  'inventory',
  'residenceRequests',
] as const;

export type TableName = (typeof TABLES)[number];

/** Descarga todas las tablas. Devuelve null si Supabase no está activo. */
export async function fetchAll(): Promise<RemoteData | null> {
  if (!isSupabaseEnabled || !supabase) return null;
  const client = supabase;
  const result = {} as Record<TableName, unknown[]>;
  await Promise.all(
    TABLES.map(async (table) => {
      const { data, error } = await client.from(table).select('*');
      if (error) {
        console.error(`[myflat] error leyendo ${table}:`, error.message);
        result[table] = [];
      } else {
        result[table] = data ?? [];
      }
    }),
  );
  return {
    users: result.users as User[],
    properties: result.properties as Property[],
    likes: result.likes as Like[],
    matches: result.matches as Match[],
    messages: result.messages as Message[],
    payments: result.payments as Payment[],
    issues: result.issues as Issue[],
    reviews: result.reviews as Review[],
    references: result.references as Reference[],
    documents: result.documents as FlatDocument[],
    inventory: result.inventory as InventoryItem[],
    residenceRequests: result.residenceRequests as ResidenceRequest[],
  };
}

/** Si la base de datos está vacía (sin usuarios), inserta los datos demo. */
export async function seedIfEmpty(demo: RemoteData): Promise<void> {
  if (!isSupabaseEnabled || !supabase) return;
  const { count, error } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true });
  if (error) {
    console.error('[myflat] no se pudo comprobar el estado de la BD:', error.message);
    return;
  }
  if ((count ?? 0) > 0) return; // ya hay datos

  // Insertar en orden; los errores se registran pero no bloquean.
  for (const table of TABLES) {
    const rows = demo[table as keyof RemoteData] as unknown[];
    if (!rows.length) continue;
    const { error: insErr } = await supabase.from(table).insert(rows);
    if (insErr) console.error(`[myflat] error sembrando ${table}:`, insErr.message);
  }
}

// -- Escrituras (fire-and-forget: no bloquean la UI) ------------------------

export function persistInsert(table: TableName, row: unknown): void {
  if (!isSupabaseEnabled || !supabase) return;
  supabase
    .from(table)
    .insert(row as never)
    .then(({ error }) => {
      if (error) console.error(`[myflat] error insertando en ${table}:`, error.message);
    });
}

export function persistUpdate(
  table: TableName,
  id: string,
  patch: Record<string, unknown>,
): void {
  if (!isSupabaseEnabled || !supabase) return;
  supabase
    .from(table)
    .update(patch as never)
    .eq('id', id)
    .then(({ error }) => {
      if (error) console.error(`[myflat] error actualizando ${table}:`, error.message);
    });
}

export function persistDelete(table: TableName, id: string): void {
  if (!isSupabaseEnabled || !supabase) return;
  supabase
    .from(table)
    .delete()
    .eq('id', id)
    .then(({ error }) => {
      if (error) console.error(`[myflat] error borrando en ${table}:`, error.message);
    });
}
