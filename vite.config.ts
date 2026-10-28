import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const apiPort = process.env.PORT ?? "3001";

export default defineConfig({
  root: "client",
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: { "/api": `http://localhost:${apiPort}` },
  },
  build: { outDir: "../dist/client", emptyOutDir: true },
});
