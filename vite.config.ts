import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig(async () => ({
  plugins: [react()],

  resolve: {
    alias: {
      '~': resolve(__dirname, 'src')
    }
  },

  clearScreen: false,

  server: {
    port: 1420,
    strictPort: true
  },

  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    target: process.env.TAURI_PLATFORM == 'windows' ? 'chrome105' : 'safari13',
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_DEBUG
  }
}))
