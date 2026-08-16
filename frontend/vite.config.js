import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl";

export default defineConfig({
  plugins: [
    react(),
    basicSsl(),
  ],

  server: {
    host: true,
    port: 5173,
    https: true,

    proxy: {

      "/api": {
        target: "http://192.168.29.52:5000",
        changeOrigin: true,
        secure: false,
      },

      "/socket.io": {
        target: "http://192.168.29.52:5000",
        ws: true,
        changeOrigin: true,
      },

      "/peerjs": {
        target: "http://192.168.29.52:5000",
        ws: true,
        changeOrigin: true,
      },

    },
  },
});