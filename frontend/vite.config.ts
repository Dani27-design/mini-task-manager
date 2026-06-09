import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const serverUrl = env.VITE_SERVER_URL ?? "http://127.0.0.1:3000";

  return {
    plugins: [react()],
    test: {
      environment: "jsdom",
      setupFiles: "./src/test/setup.ts"
    },
    server: {
      proxy: {
        "/actors": serverUrl,
        "/tasks": serverUrl
      }
    }
  };
});
