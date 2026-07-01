// GitHub Pages sirve 404.html para rutas desconocidas. Al copiar index.html
// como 404.html, la SPA arranca y React Router resuelve la ruta profunda
// (p. ej. recargar /MYFLAT/discover funciona).
import { copyFileSync, existsSync } from 'node:fs';

const src = 'dist/index.html';
const dest = 'dist/404.html';

if (existsSync(src)) {
  copyFileSync(src, dest);
  console.log('SPA fallback creado: dist/404.html');
} else {
  console.warn('No se encontró dist/index.html; omitiendo fallback SPA.');
}
