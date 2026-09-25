import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // shadcn-style imports: '@/components/ui/…' → src/components/ui/…
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
})
