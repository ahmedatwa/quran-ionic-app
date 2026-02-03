/// <reference types="vitest" />

import vue from "@vitejs/plugin-vue";
import path from "path";
import { defineConfig, loadEnv } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [vue()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@jsonDataPath": path.resolve(__dirname, "./jsonData"),
      },
    },
    test: {
      globals: true,
      environment: "jsdom",
    },
    define: {
      
    
    },
  };
});
