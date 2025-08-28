import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: process.env.ELECTRON_IS_DEV ? '/' : './',
  build: {
    outDir: 'dist-react'
  },
  server: {
    port: 3000
  }
})