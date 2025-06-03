// vite.config.js
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "file:///D:/Code/VueProject/vue-site/node_modules/vite/dist/node/index.js";
import vue from "file:///D:/Code/VueProject/vue-site/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import { viteStaticCopy } from "file:///D:/Code/VueProject/vue-site/node_modules/vite-plugin-static-copy/dist/index.js";
var __vite_injected_original_import_meta_url = "file:///D:/Code/VueProject/vue-site/vite.config.js";
var vite_config_default = defineConfig({
  plugins: [
    vue(),
    viteStaticCopy({
      targets: [
        {
          src: "src/assets/css/**/*",
          // Укажите путь к исходным CSS
          dest: "assets/css"
          // Укажите папку назначения в dist
        }
      ]
    })
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
    }
  },
  server: {
    port: 5e3,
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        // Change to your backend address if different
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/api")
      }
    }
    // КОМЕНТАЕМ ВСЕ, ЧТО НИЖЕ, ЕСЛИ ПРИ ЗАПУСКЕ ПРОЕКТА ПОЛУЧАЕМ ОШИБКУ HTTP SERVER...
    // middlewareMode: 'html',
    // fs: {
    //   strict: true,
    // },
    // historyApiFallback: true // This ensures 404 requests return the index.html
  },
  base: "./"
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxDb2RlXFxcXFZ1ZVByb2plY3RcXFxcdnVlLXNpdGVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXENvZGVcXFxcVnVlUHJvamVjdFxcXFx2dWUtc2l0ZVxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovQ29kZS9WdWVQcm9qZWN0L3Z1ZS1zaXRlL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZmlsZVVSTFRvUGF0aCwgVVJMIH0gZnJvbSAnbm9kZTp1cmwnXG5cbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgdnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSdcbmltcG9ydCB7IHZpdGVTdGF0aWNDb3B5IH0gZnJvbSAndml0ZS1wbHVnaW4tc3RhdGljLWNvcHknXG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgdnVlKCksXG4gICAgdml0ZVN0YXRpY0NvcHkoe1xuICAgICAgdGFyZ2V0czogW1xuICAgICAgICB7XG4gICAgICAgICAgc3JjOiAnc3JjL2Fzc2V0cy9jc3MvKiovKicsIC8vIFx1MDQyM1x1MDQzQVx1MDQzMFx1MDQzNlx1MDQzOFx1MDQ0Mlx1MDQzNSBcdTA0M0ZcdTA0NDNcdTA0NDJcdTA0NEMgXHUwNDNBIFx1MDQzOFx1MDQ0MVx1MDQ0NVx1MDQzRVx1MDQzNFx1MDQzRFx1MDQ0Qlx1MDQzQyBDU1NcbiAgICAgICAgICBkZXN0OiAnYXNzZXRzL2NzcycgLy8gXHUwNDIzXHUwNDNBXHUwNDMwXHUwNDM2XHUwNDM4XHUwNDQyXHUwNDM1IFx1MDQzRlx1MDQzMFx1MDQzRlx1MDQzQVx1MDQ0MyBcdTA0M0RcdTA0MzBcdTA0MzdcdTA0M0RcdTA0MzBcdTA0NDdcdTA0MzVcdTA0M0RcdTA0MzhcdTA0NEYgXHUwNDMyIGRpc3RcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0pXG4gIF0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgJ0AnOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vc3JjJywgaW1wb3J0Lm1ldGEudXJsKSksXG4gICAgfVxuICB9LFxuICBzZXJ2ZXI6IHtcbiAgICBwb3J0OiA1MDAwLFxuICAgIGhvc3Q6ICcwLjAuMC4wJyxcbiAgICBwcm94eToge1xuICAgICAgJy9hcGknOiB7XG4gICAgICAgIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6ODAwMCcsIC8vIENoYW5nZSB0byB5b3VyIGJhY2tlbmQgYWRkcmVzcyBpZiBkaWZmZXJlbnRcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gcGF0aC5yZXBsYWNlKC9eXFwvYXBpLywgJy9hcGknKSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICAvLyBcdTA0MUFcdTA0MUVcdTA0MUNcdTA0MTVcdTA0MURcdTA0MjJcdTA0MTBcdTA0MTVcdTA0MUMgXHUwNDEyXHUwNDIxXHUwNDE1LCBcdTA0MjdcdTA0MjJcdTA0MUUgXHUwNDFEXHUwNDE4XHUwNDE2XHUwNDE1LCBcdTA0MTVcdTA0MjFcdTA0MUJcdTA0MTggXHUwNDFGXHUwNDIwXHUwNDE4IFx1MDQxN1x1MDQxMFx1MDQxRlx1MDQyM1x1MDQyMVx1MDQxQVx1MDQxNSBcdTA0MUZcdTA0MjBcdTA0MUVcdTA0MTVcdTA0MUFcdTA0MjJcdTA0MTAgXHUwNDFGXHUwNDFFXHUwNDFCXHUwNDIzXHUwNDI3XHUwNDEwXHUwNDE1XHUwNDFDIFx1MDQxRVx1MDQyOFx1MDQxOFx1MDQxMVx1MDQxQVx1MDQyMyBIVFRQIFNFUlZFUi4uLlxuICAgIC8vIG1pZGRsZXdhcmVNb2RlOiAnaHRtbCcsXG4gICAgLy8gZnM6IHtcbiAgICAvLyAgIHN0cmljdDogdHJ1ZSxcbiAgICAvLyB9LFxuICAgIC8vIGhpc3RvcnlBcGlGYWxsYmFjazogdHJ1ZSAvLyBUaGlzIGVuc3VyZXMgNDA0IHJlcXVlc3RzIHJldHVybiB0aGUgaW5kZXguaHRtbFxuICB9LFxuICBiYXNlOiAnLi8nXG59KVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUEyUSxTQUFTLGVBQWUsV0FBVztBQUU5UyxTQUFTLG9CQUFvQjtBQUM3QixPQUFPLFNBQVM7QUFDaEIsU0FBUyxzQkFBc0I7QUFKc0ksSUFBTSwyQ0FBMkM7QUFPdE4sSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsSUFBSTtBQUFBLElBQ0osZUFBZTtBQUFBLE1BQ2IsU0FBUztBQUFBLFFBQ1A7QUFBQSxVQUNFLEtBQUs7QUFBQTtBQUFBLFVBQ0wsTUFBTTtBQUFBO0FBQUEsUUFDUjtBQUFBLE1BQ0Y7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNIO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLGNBQWMsSUFBSSxJQUFJLFNBQVMsd0NBQWUsQ0FBQztBQUFBLElBQ3REO0FBQUEsRUFDRjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLFFBQ04sUUFBUTtBQUFBO0FBQUEsUUFDUixjQUFjO0FBQUEsUUFDZCxTQUFTLENBQUMsU0FBUyxLQUFLLFFBQVEsVUFBVSxNQUFNO0FBQUEsTUFDbEQ7QUFBQSxJQUNGO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFPRjtBQUFBLEVBQ0EsTUFBTTtBQUNSLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
