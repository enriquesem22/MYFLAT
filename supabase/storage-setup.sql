-- ============================================================================
-- Configuración de Supabase Storage para las imágenes de Myflat
-- (fotos de pisos, planos y fotos de perfil).
--
-- PASO 1 (interfaz): crea el bucket.
--   Supabase -> Storage -> New bucket
--     Name: media
--     Public bucket: ACTIVADO (ON)
--   Create bucket.
--
-- PASO 2 (SQL): ejecuta este script en SQL Editor -> New snippet.
--   Da permiso de lectura pública y de subida con la clave anónima (MVP).
--   NOTA: es una política permisiva pensada para el MVP; en producción
--   conviene restringir la subida a usuarios autenticados y por carpeta.
-- ============================================================================

-- Lectura pública de los archivos del bucket "media".
drop policy if exists "myflat_media_read" on storage.objects;
create policy "myflat_media_read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'media');

-- Subida (insert) al bucket "media".
drop policy if exists "myflat_media_insert" on storage.objects;
create policy "myflat_media_insert" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'media');

-- Actualizar / borrar objetos del bucket "media".
drop policy if exists "myflat_media_update" on storage.objects;
create policy "myflat_media_update" on storage.objects
  for update to anon, authenticated
  using (bucket_id = 'media');

drop policy if exists "myflat_media_delete" on storage.objects;
create policy "myflat_media_delete" on storage.objects
  for delete to anon, authenticated
  using (bucket_id = 'media');
