// Comprime una imagen (redimensiona + JPEG) y devuelve tanto un Blob (para
// subir a almacenamiento) como un data URL (para previsualizar o como fallback
// en modo demo). Las fotos del móvil pueden pesar varios MB; esto las reduce.
export interface CompressedImage {
  blob: Blob;
  dataUrl: string;
}

export function compressImage(
  file: File,
  maxSize = 1200,
  quality = 0.7,
): Promise<CompressedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('No se pudo cargar la imagen'));
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas no disponible'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve({ blob, dataUrl });
            else reject(new Error('No se pudo comprimir la imagen'));
          },
          'image/jpeg',
          quality,
        );
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/** Solo el data URL (compatibilidad con el código anterior). */
export async function imageFileToDataUrl(
  file: File,
  maxSize = 1200,
  quality = 0.7,
): Promise<string> {
  const { dataUrl } = await compressImage(file, maxSize, quality);
  return dataUrl;
}
