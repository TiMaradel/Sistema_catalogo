import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

const projectDirectory = import.meta.dirname

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(projectDirectory, './src'),
      '@components': path.resolve(projectDirectory, './src/components'),
      '@pages': path.resolve(projectDirectory, './src/pages'),
      '@services': path.resolve(projectDirectory, './src/services'),
      '@contexts': path.resolve(projectDirectory, './src/contexts'),
      '@hooks': path.resolve(projectDirectory, './src/hooks'),
      '@utils': path.resolve(projectDirectory, './src/utils'),
      '@layouts': path.resolve(projectDirectory, './src/layouts'),
    }
  },
  server: {
    port: 3000,
    open: true
  }
})
