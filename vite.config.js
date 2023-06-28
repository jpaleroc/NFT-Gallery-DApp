import { defineConfig } from 'vite';
import fs from "vite-plugin-fs";

export default defineConfig({
  server: {
    open: '/src/gallery.html',
  },
  plugins: [fs()]
})