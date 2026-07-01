-- ============================================================================
-- Esquema de Myflat para Supabase (PostgreSQL)
--
-- Cómo usarlo:
--   1. Entra en tu proyecto de Supabase.
--   2. Menú lateral: SQL Editor -> New query.
--   3. Pega TODO este archivo y pulsa "Run".
--
-- Notas:
--   - Los nombres de columna van entre comillas para conservar camelCase y
--     coincidir 1:1 con los tipos de la app (así no hay conversiones).
--   - Las fechas se guardan como texto (ISO) para simplificar el MVP.
--   - Los objetos anidados (preferences, rules, photos, comments, ratings)
--     se guardan como jsonb.
--   - RLS: se habilita con políticas PERMISIVAS (lectura/escritura para el rol
--     anónimo). Esto es adecuado para un MVP/demo, NO para producción real.
--     En producción habría que restringir según el usuario autenticado.
-- ============================================================================

create table if not exists public.users (
  id text primary key,
  email text unique not null,
  name text not null,
  age int default 0,
  city text default '',
  role text not null default 'seeker_room',
  "photoUrl" text default '',
  bio text default '',
  profession text default '',
  budget int default 0,
  "moveInDate" text default '',
  "instagramConnected" boolean default false,
  "linkedinConnected" boolean default false,
  "instagramUrl" text,
  "linkedinUrl" text,
  "instagramShowPhotos" boolean default false,
  "identityVerified" boolean default false,
  "phoneVerified" boolean default false,
  preferences jsonb default '{}'::jsonb,
  "referencesCount" int default 0,
  "createdAt" text default '',
  "updatedAt" text default ''
);

create table if not exists public.properties (
  id text primary key,
  "ownerId" text not null,
  title text not null,
  city text default '',
  neighborhood text default '',
  "approximateAddress" text default '',
  price int default 0,
  deposit int default 0,
  "expensesIncluded" boolean default false,
  "availableFrom" text default '',
  "minStayMonths" int default 0,
  rooms int default 0,
  bathrooms int default 0,
  "currentRoommates" int default 0,
  description text default '',
  rules jsonb default '{}'::jsonb,
  "verifiedProperty" boolean default false,
  "verifiedOwner" boolean default false,
  "hasVideo" boolean default false,
  photos jsonb default '[]'::jsonb,
  plans jsonb default '[]'::jsonb,
  videos jsonb default '[]'::jsonb,
  "residentIds" jsonb default '[]'::jsonb,
  "ownerLivesHere" boolean default false,
  "createdAt" text default '',
  "updatedAt" text default ''
);

create table if not exists public.likes (
  id text primary key,
  "fromUserId" text not null,
  "targetType" text not null,
  "targetId" text not null,
  direction text not null,
  "createdAt" text default ''
);

create table if not exists public.matches (
  id text primary key,
  "userAId" text not null,
  "userBId" text not null,
  "propertyId" text,
  status text default 'active',
  "createdAt" text default ''
);

create table if not exists public.messages (
  id text primary key,
  "matchId" text not null,
  "senderId" text not null,
  text text not null,
  "createdAt" text default '',
  "readAt" text
);

create table if not exists public.payments (
  id text primary key,
  "propertyId" text not null,
  "tenantId" text not null,
  "ownerId" text not null,
  amount int default 0,
  "dueDate" text default '',
  status text default 'pendiente',
  "proofUrl" text,
  "confirmedAt" text,
  "paymentProvider" text,
  "paymentIntentId" text,
  "platformFee" int,
  "landlordPayoutStatus" text default 'none',
  "createdAt" text default ''
);

create table if not exists public.issues (
  id text primary key,
  "propertyId" text not null,
  "createdBy" text not null,
  "assignedTo" text,
  title text not null,
  category text default 'Otro',
  description text default '',
  urgency text default 'media',
  status text default 'nueva',
  "photoUrl" text,
  comments jsonb default '[]'::jsonb,
  "createdAt" text default '',
  "updatedAt" text default ''
);

create table if not exists public.reviews (
  id text primary key,
  "reviewerId" text not null,
  "reviewedUserId" text,
  "propertyId" text,
  "reviewType" text not null,
  ratings jsonb default '{}'::jsonb,
  comment text default '',
  response text,
  "createdAt" text default ''
);

create table if not exists public.references (
  id text primary key,
  "userId" text not null,
  "refereeName" text default '',
  "refereeEmail" text default '',
  "relationshipType" text default '',
  status text default 'pendiente',
  rating int,
  comment text,
  "createdAt" text default ''
);

create table if not exists public.documents (
  id text primary key,
  "propertyId" text not null,
  "userId" text not null,
  type text default 'otro',
  title text default '',
  url text default '',
  "createdAt" text default ''
);

create table if not exists public.inventory (
  id text primary key,
  "propertyId" text not null,
  label text default '',
  condition text default 'bueno',
  note text
);

create table if not exists public."residenceRequests" (
  id text primary key,
  "propertyId" text not null,
  "userId" text not null,
  status text default 'pendiente',
  "createdAt" text default ''
);

-- ---------------------------------------------------------------------------
-- Row Level Security (RLS) — políticas PERMISIVAS para MVP/demo.
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
  tables text[] := array[
    'users','properties','likes','matches','messages','payments',
    'issues','reviews','references','documents','inventory','residenceRequests'
  ];
begin
  foreach t in array tables loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists "myflat_all" on public.%I;', t);
    execute format(
      'create policy "myflat_all" on public.%I for all to anon, authenticated using (true) with check (true);',
      t
    );
  end loop;
end $$;
