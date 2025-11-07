import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [dts({ rollupTypes: true })],
  build: {
    lib: {
      entry: "./lib/index.ts",
      name: "GJCV",
      fileName: "index",
    },
    // rollupOptions: {
    //   external: (id) => {
    //     // 排除整个 test 目录（相对项目根目录）
    //     if (id.includes('/test/') || id.includes('\\test\\')) return true
    //     // 如需连 __tests__ 也一并排除
    //     if (id.includes('/__tests__/') || id.includes('\\__tests__\\')) return true
    //     return false
    //   },
    //   output: {
    //     // 可选：避免将空模块写入 chunk，减少产物体积
    //     manualChunks(id) {
    //       if (id.includes('/test/') || id.includes('\\test\\')) return null
    //     },
    //   },
    // }
  },
});
