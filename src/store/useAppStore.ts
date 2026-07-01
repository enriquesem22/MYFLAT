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

// -----------------------------------------------------------------------------
// Store central de Myflat.
//
// En el MVP toda la información vive en memoria + localStorage (persist).
// Las acciones están agrupadas por dominio y son el único punto que la UI usa
// para leer/escribir; sustituir esto por llamadas a Supabase en el futuro no
// obliga a tocar los componentes.
// -----------------------------------------------------------------------------

const uid = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

interface AppState {
  // sesión
  currentUserId: string | null;
  onboardingDone: boolean;

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
  getMessages: (matchId: string) => Message[];
  sendMessage: (matchId: string, text: string) => void;

  // ---- propiedades ----
  addProperty: (data: Omit<Property, 'id' | 'createdAt' | 'updatedAt' | 'photos'> & { photos?: Property['photos'] }) => Property;
  updateProperty: (id: string, patch: Partial<Property>) => void;

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
});

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUserId: null,
      onboardingDone: false,
      ...initialData(),

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
      },

      logout: () => set({ currentUserId: null }),
      setOnboardingDone: (done) => set({ onboardingDone: done }),

      // ---------------- usuarios ----------------
      updateCurrentUser: (patch) =>
        set((s) => ({
          users: s.users.map((u) =>
            u.id === s.currentUserId
              ? { ...u, ...patch, updatedAt: new Date().toISOString() }
              : u,
          ),
        })),

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
        if (match) set((s) => ({ matches: [...s.matches, match as Match] }));
        return match;
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
        return prop;
      },

      updateProperty: (id, patch) =>
        set((s) => ({
          properties: s.properties.map((p) =>
            p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p,
          ),
        })),

      // ---------------- pagos ----------------
      markPaymentPaid: (id, proofUrl) =>
        set((s) => ({
          payments: s.payments.map((p) =>
            p.id === id ? { ...p, status: 'pagado', proofUrl: proofUrl ?? p.proofUrl } : p,
          ),
        })),

      confirmPayment: (id) =>
        set((s) => ({
          payments: s.payments.map((p) =>
            p.id === id
              ? { ...p, status: 'pagado', confirmedAt: new Date().toISOString() }
              : p,
          ),
        })),

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
        return issue;
      },

      updateIssueStatus: (id, status) =>
        set((s) => ({
          issues: s.issues.map((i) =>
            i.id === id ? { ...i, status, updatedAt: new Date().toISOString() } : i,
          ),
        })),

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
        set((s) => ({
          issues: s.issues.map((i) =>
            i.id === issueId
              ? { ...i, comments: [...i.comments, comment], updatedAt: comment.createdAt }
              : i,
          ),
        }));
      },

      // ---------------- reviews / referencias ----------------
      addReview: (data) => {
        const review: Review = { ...data, id: uid('rev'), createdAt: new Date().toISOString() };
        set((s) => ({ reviews: [review, ...s.reviews] }));
      },

      addReference: (data) => {
        const me = get().currentUserId;
        const reference: Reference = {
          ...data,
          id: uid('ref'),
          status: 'pendiente',
          createdAt: new Date().toISOString(),
        };
        set((s) => ({
          references: [reference, ...s.references],
          // Al pedir una referencia sumamos al contador del usuario (demo).
          users: s.users.map((u) =>
            u.id === me ? { ...u, referencesCount: u.referencesCount + 1 } : u,
          ),
        }));
      },

      resetDemo: () =>
        set({ currentUserId: null, onboardingDone: false, ...initialData() }),
    }),
    {
      name: 'myflat-store',
      version: 1,
    },
  ),
);
