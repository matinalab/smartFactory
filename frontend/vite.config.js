import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern",
        silenceDeprecations: ['legacy-js-api']
      }
    }
  },
  base: "./",
  server: {
    host: "0.0.0.0",
    https: false,
    port: 8080,
    open: false,
    cors: true,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  build: {
    target: "modules",
    outDir: "dist",
    assetsDir: "assets",
    minify: "terser",
  },
});


