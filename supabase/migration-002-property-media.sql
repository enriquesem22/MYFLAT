-- ============================================================================
-- Migración 002: campos de media y residentes en la tabla properties.
--
-- Ejecuta este script en tu proyecto de Supabase (SQL Editor -> New snippet)
-- SI ya creaste las tablas antes de añadir estas columnas. Es seguro ejecutarlo
-- varias veces (usa IF NOT EXISTS).
-- ============================================================================

alter table public.properties add column if not exists plans jsonb default '[]'::jsonb;
alter table public.properties add column if not exists videos jsonb default '[]'::jsonb;
alter table public.properties add column if not exists "residentIds" jsonb default '[]'::jsonb;
alter table public.properties add column if not exists "ownerLivesHere" boolean default false;
