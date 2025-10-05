import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import solid from 'vite-plugin-solid';

export default defineConfig({
  plugins: [
    solid(),
    viteSingleFile()
  ],
  build: {
    rollupOptions: {
      input: 'src/main.tsx'
    }
  }
});
