import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { liveIntelPlugin } from './src/liveIntelPlugin.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), liveIntelPlugin()],
})

