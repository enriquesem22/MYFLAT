import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  FlatDocument,
  InventoryItem,
  Issue,
  IssueComment,
  IssueStatus,
  Like,
  LikeDirection,
  Match,
  Message,
  Payment,
  Property,
  Reference,
  ResidenceRequest,
  Review,
  User,
} from '@/types';
import { demoUsers } from '@/data/demoUsers';
import { demoProperties } from '@/data/demoProperties';
import { demoLikes, demoMatches, demoMessages } from '@/data/demoMatches';
import { demoPayments } from '@/data/demoPayments';
import { demoIssues } from '@/data/demoIssues';
import { demoReviews, demoReferences } from '@/data/demoReviews';
import { demoDocuments, demoInventory } from '@/data/demoFlat';
import { isSupabaseEnabled } from '@/lib/supabase';
import {
  fetchAll,
  persistDelete,
  persistInsert,
  persistUpdate,
  seedIfEmpty,
  type RemoteData,
} from '@/lib/backend';

// -----------------------------------------------------------------------------
// Store central de Myflat.
//
// Modo demo: toda la información vive en memoria + localStorage (persist).
// Modo Supabase (si hay credenciales): se hidrata desde la base de datos y las
// escrituras se replican en ella (fire-and-forget). En ambos casos la UI lee y
// escribe siempre a través de este store, sin cambios en los componentes.
// -----------------------------------------------------------------------------

const uid = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

interface AppState {
  // sesión
  currentUserId: string | null;
  onboardingDone: boolean;
  ready: boolean; // true cuando ya se ha hidratado (o en modo demo)

  // Carga inicial: en modo Supabase descarga los datos (y siembra demo si la
  // base está vacía). En modo demo no hace nada.
  hydrate: () => Promise<void>;

  // datos
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

  // ---- auth / sesión ----
  login: (email: string) => boolean;
  register: (data: { name: string; email: string }) => void;
  logout: () => void;
  setOnboardingDone: (done: boolean) => void;

  // ---- usuarios ----
  updateCurrentUser: (patch: Partial<User>) => void;
  getUser: (id: string) => User | undefined;

  // ---- swipe / likes / matches ----
  swipe: (targetType: Like['targetType'], targetId: string, direction: LikeDirection) => Match | null;
  /** Quita un elemento de "guardados" (elimina los likes con dirección save). */
  unsave: (targetId: string) => void;
  getMessages: (matchId: string) => Message[];
  sendMessage: (matchId: string, text: string) => void;

  // ---- propiedades ----
  addProperty: (data: Omit<Property, 'id' | 'createdAt' | 'updatedAt' | 'photos'> & { photos?: Property['photos'] }) => Property;
  updateProperty: (id: string, patch: Partial<Property>) => void;

  // ---- residentes (con confirmación del propietario) ----
  requestResidence: (propertyId: string) => void;
  respondResidence: (requestId: string, accept: boolean) => void;

  // ---- tenencia ----
  // Marca que el usuario ha entrado a vivir en un piso: activa "Mi piso" y
  // crea su primer pago mensual. Devuelve false si ya vivía allí.
  moveIntoProperty: (propertyId: string) => boolean;

  // ---- pagos ----
  markPaymentPaid: (id: string, proofUrl?: string) => void;
  confirmPayment: (id: string) => void;

  // ---- incidencias ----
  addIssue: (data: Omit<Issue, 'id' | 'comments' | 'createdAt' | 'updatedAt' | 'status'>) => Issue;
  updateIssueStatus: (id: string, status: IssueStatus) => void;
  addIssueComment: (issueId: string, text: string) => void;

  // ---- reviews / referencias ----
  addReview: (data: Omit<Review, 'id' | 'createdAt'>) => void;
  addReference: (data: Omit<Reference, 'id' | 'status' | 'createdAt'>) => void;

  resetDemo: () => void;
}

const initialData = () => ({
  users: demoUsers,
  properties: demoProperties,
  likes: demoLikes,
  matches: demoMatches,
  messages: demoMessages,
  payments: demoPayments,
  issues: demoIssues,
  reviews: demoReviews,
  references: demoReferences,
  documents: demoDocuments,
  inventory: demoInventory,
  residenceRequests: [] as ResidenceRequest[],
});

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUserId: null,
      onboardingDone: false,
      ready: !isSupabaseEnabled, // en modo demo está listo de inmediato
      ...initialData(),

      // ---------------- carga inicial ----------------
      hydrate: async () => {
        if (!isSupabaseEnabled) {
          set({ ready: true });
          return;
        }
        try {
          // Sembrar datos demo si la base está vacía (primera vez).
          await seedIfEmpty(initialData() as RemoteData);
          const data = await fetchAll();
          // Solo sustituimos los datos demo si de verdad hay usuarios en la
          // nube. Si la BD está vacía o falla (p. ej. no se ejecutó el SQL),
          // conservamos los datos demo locales para no dejar la app en blanco.
          if (data && data.users.length > 0) {
            set({
              users: data.users,
              properties: data.properties,
              likes: data.likes,
              matches: data.matches,
              messages: data.messages,
              payments: data.payments,
              issues: data.issues,
              reviews: data.reviews,
              references: data.references,
              documents: data.documents,
              inventory: data.inventory,
              residenceRequests: data.residenceRequests,
            });
          }
        } catch (e) {
          console.error('[myflat] fallo al hidratar desde Supabase:', e);
        } finally {
          set({ ready: true });
        }
      },

      // ---------------- auth ----------------
      login: (email) => {
        const user = get().users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (!user) return false;
        set({ currentUserId: user.id, onboardingDone: true });
        return true;
      },

      register: ({ name, email }) => {
        const now = new Date().toISOString();
        const newUser: User = {
          id: uid('u'),
          email,
          name,
          age: 25,
          city: '',
          role: 'seeker_room',
          photoUrl: '',
          bio: '',
          profession: '',
          budget: 600,
          moveInDate: now.slice(0, 10),
          instagramConnected: false,
          linkedinConnected: false,
          identityVerified: false,
          phoneVerified: false,
          preferences: {
            smoking: false,
            pets: false,
            cleaningLevel: 'media',
            noiseLevel: 'medio',
            remoteWork: false,
            visitsFrequency: 'medias',
            partyFrequency: 'a veces',
            lifestylePreference: 'mixta',
          },
          referencesCount: 0,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({
          users: [...s.users, newUser],
          currentUserId: newUser.id,
          onboardingDone: false,
        }));
        persistInsert('users', newUser);
      },

      logout: () => set({ currentUserId: null }),
      setOnboardingDone: (done) => set({ onboardingDone: done }),

      // ---------------- usuarios ----------------
      updateCurrentUser: (patch) => {
        const id = get().currentUserId;
        if (!id) return;
        const fullPatch = { ...patch, updatedAt: new Date().toISOString() };
        set((s) => ({
          users: s.users.map((u) => (u.id === id ? { ...u, ...fullPatch } : u)),
        }));
        persistUpdate('users', id, fullPatch);
      },

      getUser: (id) => get().users.find((u) => u.id === id),

      // ---------------- swipe ----------------
      swipe: (targetType, targetId, direction) => {
        const me = get().currentUserId;
        if (!me) return null;
        const like: Like = {
          id: uid('like'),
          fromUserId: me,
          targetType,
          targetId,
          direction,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ likes: [...s.likes, like] }));
        persistInsert('likes', like);

        // Solo "like" (me interesa) puede generar match. En el MVP simulamos la
        // reciprocidad: si damos like, la otra parte "acepta" y se crea match.
        if (direction !== 'like') return null;

        let match: Match | null = null;
        if (targetType === 'property') {
          const prop = get().properties.find((p) => p.id === targetId);
          if (prop) {
            match = {
              id: uid('m'),
              userAId: me,
              userBId: prop.ownerId,
              propertyId: prop.id,
              status: 'active',
              createdAt: new Date().toISOString(),
            };
          }
        } else {
          match = {
            id: uid('m'),
            userAId: me,
            userBId: targetId,
            status: 'active',
            createdAt: new Date().toISOString(),
          };
        }
        if (match) {
          set((s) => ({ matches: [...s.matches, match as Match] }));
          persistInsert('matches', match);
        }
        return match;
      },

      unsave: (targetId) => {
        const me = get().currentUserId;
        if (!me) return;
        const toRemove = get().likes.filter(
          (l) => l.fromUserId === me && l.targetId === targetId && l.direction === 'save',
        );
        set((s) => ({
          likes: s.likes.filter(
            (l) =>
              !(l.fromUserId === me && l.targetId === targetId && l.direction === 'save'),
          ),
        }));
        toRemove.forEach((l) => persistDelete('likes', l.id));
      },

      getMessages: (matchId) =>
        get()
          .messages.filter((m) => m.matchId === matchId)
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),

      sendMessage: (matchId, text) => {
        const me = get().currentUserId;
        if (!me || !text.trim()) return;
        const msg: Message = {
          id: uid('msg'),
          matchId,
          senderId: me,
          text: text.trim(),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ messages: [...s.messages, msg] }));
        persistInsert('messages', msg);
      },

      // ---------------- propiedades ----------------
      addProperty: (data) => {
        const now = new Date().toISOString();
        const prop: Property = {
          ...data,
          id: uid('p'),
          photos: data.photos ?? [],
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ properties: [...s.properties, prop] }));
        persistInsert('properties', prop);
        return prop;
      },

      updateProperty: (id, patch) => {
        const fullPatch = { ...patch, updatedAt: new Date().toISOString() };
        set((s) => ({
          properties: s.properties.map((p) => (p.id === id ? { ...p, ...fullPatch } : p)),
        }));
        persistUpdate('properties', id, fullPatch);
      },

      // ---------------- residentes ----------------
      requestResidence: (propertyId) => {
        const me = get().currentUserId;
        if (!me) return;
        // No duplicar una solicitud pendiente para el mismo piso.
        const exists = get().residenceRequests.some(
          (r) => r.propertyId === propertyId && r.userId === me && r.status === 'pendiente',
        );
        if (exists) return;
        const req: ResidenceRequest = {
          id: uid('rr'),
          propertyId,
          userId: me,
          status: 'pendiente',
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ residenceRequests: [req, ...s.residenceRequests] }));
        persistInsert('residenceRequests', req);
      },

      respondResidence: (requestId, accept) => {
        const req = get().residenceRequests.find((r) => r.id === requestId);
        if (!req) return;
        const status = accept ? 'aceptada' : 'rechazada';
        set((s) => ({
          residenceRequests: s.residenceRequests.map((r) =>
            r.id === requestId ? { ...r, status } : r,
          ),
        }));
        persistUpdate('residenceRequests', requestId, { status });

        // Si se acepta, añadir el usuario a los residentes del piso.
        if (accept) {
          const prop = get().properties.find((p) => p.id === req.propertyId);
          if (prop && !(prop.residentIds ?? []).includes(req.userId)) {
            const residentIds = [...(prop.residentIds ?? []), req.userId];
            set((s) => ({
              properties: s.properties.map((p) =>
                p.id === prop.id ? { ...p, residentIds } : p,
              ),
            }));
            persistUpdate('properties', prop.id, { residentIds });
          }
        }
      },

      // ---------------- tenencia ----------------
      moveIntoProperty: (propertyId) => {
        const me = get().currentUserId;
        if (!me) return false;
        const property = get().properties.find((p) => p.id === propertyId);
        if (!property) return false;

        // Si ya es inquilino de ese piso (tiene pagos), no duplicar.
        const already = get().payments.some(
          (p) => p.propertyId === propertyId && p.tenantId === me,
        );
        if (already) return false;

        // Primer pago mensual: vence el día 5 del mes que viene.
        const now = new Date();
        const due = new Date(now.getFullYear(), now.getMonth() + 1, 5);
        const payment: Payment = {
          id: uid('pay'),
          propertyId,
          tenantId: me,
          ownerId: property.ownerId,
          amount: property.price,
          dueDate: due.toISOString().slice(0, 10),
          status: 'pendiente',
          landlordPayoutStatus: 'none',
          createdAt: now.toISOString(),
        };
        set((s) => ({ payments: [...s.payments, payment] }));
        persistInsert('payments', payment);
        return true;
      },

      // ---------------- pagos ----------------
      markPaymentPaid: (id, proofUrl) => {
        const existing = get().payments.find((p) => p.id === id);
        const patch = { status: 'pagado' as const, proofUrl: proofUrl ?? existing?.proofUrl };
        set((s) => ({
          payments: s.payments.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        }));
        persistUpdate('payments', id, patch);
      },

      confirmPayment: (id) => {
        const patch = { status: 'pagado' as const, confirmedAt: new Date().toISOString() };
        set((s) => ({
          payments: s.payments.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        }));
        persistUpdate('payments', id, patch);
      },

      // ---------------- incidencias ----------------
      addIssue: (data) => {
        const now = new Date().toISOString();
        const issue: Issue = {
          ...data,
          id: uid('iss'),
          status: 'nueva',
          comments: [],
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ issues: [issue, ...s.issues] }));
        persistInsert('issues', issue);
        return issue;
      },

      updateIssueStatus: (id, status) => {
        const patch = { status, updatedAt: new Date().toISOString() };
        set((s) => ({
          issues: s.issues.map((i) => (i.id === id ? { ...i, ...patch } : i)),
        }));
        persistUpdate('issues', id, patch);
      },

      addIssueComment: (issueId, text) => {
        const me = get().currentUserId;
        if (!me || !text.trim()) return;
        const comment: IssueComment = {
          id: uid('ic'),
          issueId,
          userId: me,
          text: text.trim(),
          createdAt: new Date().toISOString(),
        };
        const target = get().issues.find((i) => i.id === issueId);
        const comments = [...(target?.comments ?? []), comment];
        set((s) => ({
          issues: s.issues.map((i) =>
            i.id === issueId ? { ...i, comments, updatedAt: comment.createdAt } : i,
          ),
        }));
        persistUpdate('issues', issueId, { comments, updatedAt: comment.createdAt });
      },

      // ---------------- reviews / referencias ----------------
      addReview: (data) => {
        const review: Review = { ...data, id: uid('rev'), createdAt: new Date().toISOString() };
        set((s) => ({ reviews: [review, ...s.reviews] }));
        persistInsert('reviews', review);
      },

      addReference: (data) => {
        const me = get().currentUserId;
        const reference: Reference = {
          ...data,
          id: uid('ref'),
          status: 'pendiente',
          createdAt: new Date().toISOString(),
        };
        // Al pedir una referencia sumamos al contador del usuario.
        const meUser = get().users.find((u) => u.id === me);
        const newCount = (meUser?.referencesCount ?? 0) + 1;
        set((s) => ({
          references: [reference, ...s.references],
          users: s.users.map((u) =>
            u.id === me ? { ...u, referencesCount: newCount } : u,
          ),
        }));
        persistInsert('references', reference);
        if (me) persistUpdate('users', me, { referencesCount: newCount });
      },

      resetDemo: () =>
        set({ currentUserId: null, onboardingDone: false, ...initialData() }),
    }),
    {
      name: 'myflat-store',
      version: 1,
      // En modo Supabase los datos vienen de la nube en cada carga, así que solo
      // persistimos la sesión. En modo demo persistimos todo el estado local.
      partialize: (state) =>
        isSupabaseEnabled
          ? { currentUserId: state.currentUserId, onboardingDone: state.onboardingDone }
          : state,
    },
  ),
);
