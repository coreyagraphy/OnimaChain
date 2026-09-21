import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import netlify from '@netlify/vite-plugin-tanstack-start'

export default defineConfig({
  server: { host: '0.0.0.0', port: 8080 },
  plugins: [tsconfigPaths(), tailwindcss(), tanstackStart(), netlify(), viteReact()],
  // Netlify's ESM functions need the complete SSR graph bundled so mixed-format
  // packages resolve consistently in the production function runtime.
  ssr: { noExternal: true },
})
