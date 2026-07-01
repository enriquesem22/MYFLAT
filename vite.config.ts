import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// https://vitejs.dev/config/
// En producción (build para GitHub Pages) la app se sirve bajo /MYFLAT/.
// En desarrollo se sirve en la raíz.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/MYFLAT/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}));
