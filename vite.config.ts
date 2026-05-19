import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { vercelApiDevPlugin } from "./vite-api-dev-plugin";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), vercelApiDevPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
