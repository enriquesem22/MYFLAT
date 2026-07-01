// Modelos de datos de Myflat.
// Estos tipos reflejan el esquema de base de datos previsto (ver README) y
// permiten sustituir la capa de datos demo por un backend real (Supabase)
// sin tocar la UI.

export type UserRole = 'seeker_room' | 'seeker_roommate' | 'owner';

export type CleaningLevel = 'baja' | 'media' | 'alta';
export type NoiseLevel = 'bajo' | 'medio' | 'alto';
export type VisitsFrequency = 'pocas' | 'medias' | 'frecuentes';
export type PartyFrequency = 'nunca' | 'a veces' | 'frecuente';
export type LifestylePreference = 'tranquila' | 'social' | 'mixta';

export type ProfileLevel = 'basic' | 'social' | 'verified' | 'recommended';

export interface UserPreferences {
  smoking: boolean;
  pets: boolean;
  cleaningLevel: CleaningLevel;
  noiseLevel: NoiseLevel;
  remoteWork: boolean;
  visitsFrequency: VisitsFrequency;
  partyFrequency: PartyFrequency;
  lifestylePreference: LifestylePreference;
}

export interface User {
  id: string;
  email: string;
  name: string;
  age: number;
  city: string;
  role: UserRole;
  photoUrl: string;
  bio: string;
  profession: string;
  budget: number; // presupuesto (seeker) o precio de referencia (owner)
  moveInDate: string; // ISO date - fecha de entrada o disponibilidad
  instagramConnected: boolean;
  linkedinConnected: boolean;
  instagramUrl?: string; // enlace al perfil de Instagram
  linkedinUrl?: string; // enlace al perfil de LinkedIn
  instagramShowPhotos?: boolean; // mostrar previsualización de fotos (futuro)
  identityVerified: boolean;
  phoneVerified: boolean;
  preferences: UserPreferences;
  referencesCount: number; // nº de referencias verificadas (para nivel de perfil)
  createdAt: string;
  updatedAt: string;
}

export interface PropertyRules {
  smoking: boolean; // permitido fumar
  pets: boolean; // permite mascotas
  couples: boolean; // permite parejas
  visits: VisitsFrequency;
  parties: PartyFrequency;
  cleaning: CleaningLevel;
}

export interface PropertyPhoto {
  id: string;
  propertyId: string;
  url: string;
  isMain: boolean;
}

export interface Property {
  id: string;
  ownerId: string;
  title: string;
  city: string;
  neighborhood: string;
  approximateAddress: string;
  price: number;
  deposit: number;
  expensesIncluded: boolean;
  availableFrom: string; // ISO date
  minStayMonths: number;
  rooms: number;
  bathrooms: number;
  currentRoommates: number;
  description: string;
  rules: PropertyRules;
  verifiedProperty: boolean;
  verifiedOwner: boolean;
  hasVideo: boolean;
  photos: PropertyPhoto[];
  plans?: string[]; // planos del piso (imágenes)
  videos?: string[]; // vídeos (enlaces)
  residentIds?: string[]; // personas que viven actualmente en el piso
  ownerLivesHere?: boolean; // el propietario también vive en el piso
  createdAt: string;
  updatedAt: string;
}

export type LikeTargetType = 'user' | 'property';
export type LikeDirection = 'like' | 'dislike' | 'save';

export interface Like {
  id: string;
  fromUserId: string;
  targetType: LikeTargetType;
  targetId: string;
  direction: LikeDirection;
  createdAt: string;
}

export type MatchStatus = 'active' | 'archived';

export interface Match {
  id: string;
  userAId: string;
  userBId: string;
  propertyId?: string;
  status: MatchStatus;
  createdAt: string;
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  text: string;
  createdAt: string;
  readAt?: string;
}

export type PaymentStatus = 'pendiente' | 'pagado' | 'retrasado';
export type LandlordPayoutStatus = 'none' | 'pending' | 'paid';

export interface Payment {
  id: string;
  propertyId: string;
  tenantId: string;
  ownerId: string;
  amount: number;
  dueDate: string; // ISO date
  status: PaymentStatus;
  proofUrl?: string;
  confirmedAt?: string;
  // Campos preparados para futura integración con Stripe Connect / similar.
  paymentProvider?: string;
  paymentIntentId?: string;
  platformFee?: number;
  landlordPayoutStatus: LandlordPayoutStatus;
  createdAt: string;
}

export type IssueCategory =
  | 'Lavadora'
  | 'Internet'
  | 'Humedad'
  | 'Llaves'
  | 'Calefacción'
  | 'Aire acondicionado'
  | 'Ruido'
  | 'Limpieza'
  | 'Electricidad'
  | 'Fontanería'
  | 'Otro';

export type IssueUrgency = 'baja' | 'media' | 'alta';

export type IssueStatus =
  | 'nueva'
  | 'en revisión'
  | 'técnico avisado'
  | 'programada'
  | 'resuelta'
  | 'rechazada'
  | 'disputa';

export interface IssueComment {
  id: string;
  issueId: string;
  userId: string;
  text: string;
  createdAt: string;
}

export interface Issue {
  id: string;
  propertyId: string;
  createdBy: string;
  assignedTo?: string;
  title: string;
  category: IssueCategory;
  description: string;
  urgency: IssueUrgency;
  status: IssueStatus;
  photoUrl?: string;
  comments: IssueComment[];
  createdAt: string;
  updatedAt: string;
}

export type ReviewType = 'roommate' | 'landlord' | 'tenant' | 'property';

export interface Review {
  id: string;
  reviewerId: string;
  reviewedUserId?: string;
  propertyId?: string;
  reviewType: ReviewType;
  ratings: Record<string, number>; // categoría -> nota (1..5)
  comment: string;
  response?: string; // derecho de respuesta
  createdAt: string;
}

export type ReferenceStatus = 'pendiente' | 'confirmada' | 'rechazada';

export interface Reference {
  id: string;
  userId: string;
  refereeName: string;
  refereeEmail: string;
  relationshipType: string; // ex-compañero, ex-casero, etc.
  status: ReferenceStatus;
  rating?: number;
  comment?: string;
  createdAt: string;
}

export type ResidenceRequestStatus = 'pendiente' | 'aceptada' | 'rechazada';

// Solicitud de un usuario para figurar como residente de un piso. Solo cuando
// el propietario la acepta, el usuario pasa a la lista de residentes del piso.
export interface ResidenceRequest {
  id: string;
  propertyId: string;
  userId: string;
  status: ResidenceRequestStatus;
  createdAt: string;
}

export type DocumentType =
  | 'contrato'
  | 'inventario'
  | 'justificante'
  | 'normas'
  | 'otro';

export interface FlatDocument {
  id: string;
  propertyId: string;
  userId: string;
  type: DocumentType;
  title: string;
  url: string;
  createdAt: string;
}

// Inventario de entrada (estado simple para el MVP).
export interface InventoryItem {
  id: string;
  propertyId: string;
  label: string;
  condition: 'nuevo' | 'bueno' | 'usado' | 'defectuoso';
  note?: string;
}
