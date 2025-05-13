import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    viteStaticCopy({
      targets: [
        { src: 'src/assets/css/**/*', dest: 'src/assets/css' },
        { src: 'src/assets/js/**/*', dest: 'src/assets/js' },
        { src: 'src/assets/images/**/*', dest: 'src/assets/images' }      
      ]
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    }
  },
  server: {
    port: 5000,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // Change to your backend address if different
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
    // КОМЕНТАЕМ ВСЕ, ЧТО НИЖЕ, ЕСЛИ ПРИ ЗАПУСКЕ ПРОЕКТА ПОЛУЧАЕМ ОШИБКУ HTTP SERVER...
    // middlewareMode: 'html',
    // fs: {
    //   strict: true,
    // },
    // historyApiFallback: true // This ensures 404 requests return the index.html
  },
  base: './'
})
