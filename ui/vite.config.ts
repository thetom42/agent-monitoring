import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000, // Increase size limit to 1000kb
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React chunk
          'vendor-react': ['react', 'react-dom'],
          // MUI and styling related chunk
          'vendor-mui': [
            '@mui/material',
            '@mui/icons-material',
            '@emotion/react',
            '@emotion/styled',
            '@fontsource/roboto'
          ],
          // Data visualization chunk
          'vendor-charts': ['recharts']
        }
      }
    }
  }
})
