import { isSupabaseEnabled, supabase } from './supabase';
import { compressImage } from '@/utils/media';

// Subida de imágenes. Con Supabase activo, sube el archivo (comprimido) al
// bucket público "media" y devuelve su URL pública. En modo demo (sin
// Supabase), devuelve un data URL como fallback para poder probar en local.
//
// El bucket "media" debe existir y ser público (ver README / instrucciones).
const BUCKET = 'media';

export type MediaFolder = 'properties' | 'avatars' | 'plans';

const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export async function uploadImageFile(file: File, folder: MediaFolder): Promise<string> {
  const { blob, dataUrl } = await compressImage(file);

  if (!isSupabaseEnabled || !supabase) {
    // Modo demo: sin almacenamiento remoto, usamos el data URL.
    return dataUrl;
  }

  const path = `${folder}/${uid()}.jpg`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: 'image/jpeg',
    upsert: false,
  });
  if (error) {
    throw new Error(`No se pudo subir la imagen: ${error.message}`);
  }
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
