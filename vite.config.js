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
        {
          src: 'src/assets/css/**/*', // Укажите путь к исходным CSS
          dest: 'assets/css' // Укажите папку назначения в dist
        }
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

    // КОМЕНТАЕМ ВСЕ, ЧТО НИЖЕ, ЕСЛИ ПРИ ЗАПУСКЕ ПРОЕКТА ПОЛУЧАЕМ ОШИБКУ HTTP SERVER...
    // middlewareMode: 'html',
    // fs: {
    //   strict: true,
    // },
    // historyApiFallback: true // This ensures 404 requests return the index.html
  },
  base: './'
})
