import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // 👇 this part ensures your frontend talks to backend correctly
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5001", // your backend address
        changeOrigin: true,
        secure: false,
      },
    },
  },
});