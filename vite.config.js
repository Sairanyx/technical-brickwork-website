import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      input: {
        main:    resolve(__dirname, 'index.html'),
        quote:   resolve(__dirname, 'quote.html'),
        admin:   resolve(__dirname, 'admin.html'),
        privacy: resolve(__dirname, 'privacy.html'),
        cookies: resolve(__dirname, 'cookies.html'),
        terms:   resolve(__dirname, 'terms.html')
      }
    }
  }
})
