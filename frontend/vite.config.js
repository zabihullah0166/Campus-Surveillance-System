import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const apiTargets = [
  "/auth",
  "/cameras",
  "/detections",
  "/challans",
  "/students",
  "/users",
  "/access-requests",
  "/video_feed",
  "/health"
];

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: Object.fromEntries(
      apiTargets.map((path) => [
        path,
        {
          target: "http://localhost:8000",
          changeOrigin: true,
          ws: true
        }
      ])
    )
  }
});
