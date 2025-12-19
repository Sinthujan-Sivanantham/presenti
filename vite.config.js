import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // 1. Warn-Limit erhöhen (z.B. auf 1600 kBs statt 500 kBs)
    chunkSizeWarningLimit: 1600,

    // 2. Intelligentes Aufteilen der Dateien (Code Splitting)
    // Das sorgt dafür, dass Three.js in eine eigene Datei gepackt wird, 
    // die der Browser cachen kann.
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Packt Three.js und React-Three-Fiber in eine separate Datei 'vendor_three'
          if (id.includes('node_modules')) {
            if (id.includes('three') || id.includes('@react-three')) {
              return 'vendor_three';
            }
            if (id.includes('gsap')) {
              return 'vendor_gsap';
            }
            if (id.includes('@supabase')) {
              return 'vendor_supabase';
            }
          }
        },
      },
    },
  },
})