import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

export default defineConfig({
  plugins: [preact()],
  build: {
    lib: {
      entry: "src/main.tsx",
      name: "AIWorkforceWidget",
      fileName: () => "widget.js",
      formats: ["iife"],
    },
    cssCodeSplit: false, // Keep CSS together so we can inject it
    rollupOptions: {
      // Avoid externalizing dependencies so it bundles as a standalone file
    },
    outDir: "../web/public",
    emptyOutDir: false,
  },
});
