import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import topLevelAwait from "vite-plugin-top-level-await";
import { viteSingleFile } from "vite-plugin-singlefile";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    topLevelAwait({
      // The export name of top-level await promise for each chunk module
      promiseExportName: "__tla",
      // The function to generate import names of top-level await promise in each chunk module
      promiseImportName: (i: any) => `__tla_${i}`,
    }),
    viteSingleFile(),
  ],
});
