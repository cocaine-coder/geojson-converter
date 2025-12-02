import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import fs from 'fs';

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
      plugins: [dts({
        rollupTypes: true,
        afterBuild: (fm)=>{
          fm.forEach((content, fp)=>{
            if(fp.endsWith("index.d.ts")){
              fs.writeFileSync(fp, `/// <reference types="geojson" />\n ${content}`, 'utf-8');
            }
          });
        }
      })],
      build: {
        lib: {
          entry: "./lib/index.ts",
          fileName: "index",
          formats: ['es']
        },
        sourcemap: true,
        rollupOptions: {
          external: [
            '@zip.js/zip.js',
            'iconv-lite',
            'proj4',
            '@types/geojson',
            'fast-xml-parser',
            'buffer',
            'stream-browserify']
        }
      },
    }
  }
});
