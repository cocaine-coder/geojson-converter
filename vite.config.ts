import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig(({ mode }) => {
  if (mode === 'cjs') {
    return {
      build: {
        emptyOutDir: false,
        lib: {
          entry: "./lib/index.ts",
          fileName: "index",
          formats: ['cjs']
        }
      }
    }
  } else {
    return {
      plugins: [dts({ rollupTypes: true })],
      build: {
        lib: {
          entry: "./lib/index.ts",
          fileName: "index",
          formats: ['es']
        },
        rollupOptions: {
          external: ['@zip.js/zip.js', 'iconv-lite', 'proj4', '@types/geojson', 'fast-xml-parser']
        }
      },
    }
  }
});
