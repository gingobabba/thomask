import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// During `npm run dev`, forward /api calls to the local Express proxy
// (run `npm run server` in a second terminal). In production, the proxy
// lives at the same origin (Vercel function or the Express static server),
// so no proxy config is needed there.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:8787",
    },
  },
});
