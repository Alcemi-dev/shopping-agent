import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    react(),
    svgr({ include: "**/*.svg?react" }), // be exportAsDefault
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'src/main.tsx'
      },
      output: {
        entryFileNames: 'shopping-agent.js',
        chunkFileNames: 'shopping-agent-[hash].js',
        assetFileNames: (assetInfo) => {
          // Keep img assets in img/ directory with original names
          if (assetInfo.name && assetInfo.name.match(/\.(png|jpg|jpeg|gif|svg)$/)) {
            return 'img/[name][extname]'
          }
          return 'shopping-agent-[hash].[ext]'
        }
      }
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  }
});
