import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
      },
    }),
  ],
  define: {
    "process.env": process.env,
  },
  server: {
    host: true,
    port: 5173,
    allowedHosts: ["nicolas-deves.duckdns.org"],
  },
});
