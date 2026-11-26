import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import react from "@vitejs/plugin-react";

const consoleRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const server = await createServer({
  configFile: false,
  root: consoleRoot,
  plugins: [react()],
  server: {
    proxy: {
      "/api/v1": {
        target: "http://127.0.0.1:4000",
        changeOrigin: false,
        secure: true
      }
    },
    host: "127.0.0.1",
    port: 4173,
    strictPort: true,
    headers: {
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "X-Frame-Options": "DENY"
    }
  },
  esbuild: {
    tsconfigRaw: "{\"compilerOptions\":{}}"
  },
  optimizeDeps: {
    esbuildOptions: { tsconfigRaw: { compilerOptions: {} } }
  },
  build: {
    target: "es2022",
    sourcemap: false
  }
});

try {
  await server.listen();
  server.printUrls();
} catch (error) {
  await server.close();
  throw error;
}
