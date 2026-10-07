import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Relative asset paths, so the built app works from any sub-folder,
  // e.g. GitHub Pages serves it at /<repo-name>/ rather than the site root.
  base: './',
  test: {
    environment: 'node',
  },
});
