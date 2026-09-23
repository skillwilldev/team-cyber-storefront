import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  resolve: {
    alias: {
      '@': `${import.meta.dirname}/src`,
      '@shared': `${import.meta.dirname}/src/shared`,
      '@features': `${import.meta.dirname}/src/features`,
    },
  },
})