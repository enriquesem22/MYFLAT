-- ============================================================================
-- Migración 003: enlaces de redes en users + tabla de solicitudes de residencia.
--
-- Ejecuta en Supabase (SQL Editor -> New snippet) si creaste las tablas antes.
-- Es seguro ejecutarlo varias veces.
-- ============================================================================

-- Enlaces de redes sociales del usuario.
alter table public.users add column if not exists "instagramUrl" text;
alter table public.users add column if not exists "linkedinUrl" text;
alter table public.users add column if not exists "instagramShowPhotos" boolean default false;

-- Solicitudes de residencia (un residente solo aparece si el propietario acepta).
create table if not exists public."residenceRequests" (
  id text primary key,
  "propertyId" text not null,
  "userId" text not null,
  status text default 'pendiente',
  "createdAt" text default ''
);

alter table public."residenceRequests" enable row level security;
drop policy if exists "myflat_all" on public."residenceRequests";
create policy "myflat_all" on public."residenceRequests"
  for all to anon, authenticated using (true) with check (true);
