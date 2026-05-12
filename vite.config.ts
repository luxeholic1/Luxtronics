import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  root: "frontend",
  envDir: "../",
  server: {
    host: "::",
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001',
    },
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./frontend/src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
    minify: 'esbuild', // Use esbuild (faster, built-in)
    rollupOptions: {
      output: {
        // Fixed filenames WITHOUT content hashes.
        // This ensures index.html always references the same predictable
        // filenames whether the build runs locally or on Hostinger.
        // Without this, each build produces different hash-suffixed filenames
        // that don't match the committed index.html → 404 → white page.
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-ui": ["framer-motion", "@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-tooltip", "@radix-ui/react-select"],
          "vendor-query": ["@tanstack/react-query"],
          "vendor-firebase": ["firebase/app", "firebase/auth"],
          "vendor-icons": ["lucide-react"],
        },
      },
    },
  },
}));
