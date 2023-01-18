<script lang="ts">
  import { onMount } from "svelte";
  import Wasm4Game from "./Wasm4Game.svelte";

  import mainFileTemplate from "./templates/main?raw";
  import wasm4FileTemplate from "./templates/wasm4?raw";

  import { EditorView, basicSetup } from "codemirror";
  import { javascript } from "@codemirror/lang-javascript";
  import asc from "assemblyscript/dist/asc.js";

  let view: null | EditorView = null;

  let wasmBinary = null;
  let error: null | string = null;

  onMount(() => {
    // init text editor.
    view = new EditorView({
      extensions: [basicSetup, javascript()],
      parent: document.getElementById("textEdit"),
      doc: mainFileTemplate,
    });
    view.focus(); // bring in cursor focus on pageload
    view.contentDOM.setAttribute("data-enable-grammarly", "false"); // disable grammarly

    compile();
  });

  async function compile() {
    wasmBinary = null;
  
    asc
      .compileString(
        {
          "main.ts": view.state.doc.toString(),
          "wasm4.ts": wasm4FileTemplate,
        },
        {
          optimize: true,
          optimizeLevel: 3,
          shrinkLevel: 2,
          runtime: "incremental",
          memoryBase: 6560,
          converge: true,
          noAssert: true,
          importMemory: true,
          initialMemory: 1,
          maximumMemory: 1,
          noExportMemory: true,
          zeroFilledMemory: true,
        }
      )
      .then((result) => {
        if (result.error) {
          let err = `${result.error.message}`;

          if (result.stderr) {
            err += ` - ${result.stderr.toString()}`;
          }

          error = err;
          return;
        }

        wasmBinary = result.binary;
      });
  }
</script>

<main class="min-h-screen p-2 text-gray-700 bg-gray-50">
  <div class="h-full w-full md:w-2/3 lg:w-1/2 mx-auto space-y-2 flex flex-col">
    <div>
      <h1 class="font-bold text-2xl">WASM-4 Playground</h1>
      <p class="text-sm">
        Create and share <a href="https://wasm4.org" class="underline">wasm-4</a
        > retro games in your web browser.
      </p>
    </div>
    <div class="h-full grow space-y-3 flex flex-col">
      <div class="py-2 px-3 space-y-2 rounded-md border-2 border-gray-400">
        <div class="w-full flow-root space-x-2">
          <h2 class="float-left text-lg font-semibold">Game Preview</h2>
          <button class="float-right btn-primary">Download</button>
          <button class="float-right btn-primary">Share</button>
        </div>
        {#if error}
          <div class="rounded-md p-2 bg-red-700 text-gray-100 flow-root">
            <p class="float-left font-bold align-middle">Error: {error}</p>
            <button
              class="float-right select-none rounded-full w-7 h-7 hover:bg-red-800 hover:font-bold"
              on:click={() => (error = null)}
            >
              X
            </button>
          </div>
        {/if}
        <div class="rounded-md border-2 border-gray-400">
          {#if !wasmBinary}
            <p class="text-sm">loading...</p>
          {:else}
            <Wasm4Game { wasmBinary } />
          {/if}
        </div>
      </div>
      <div class="p-2 space-y-2 rounded-md border-2 border-gray-400">
        <h2 class="text-lg font-semibold">Text Editor</h2>
        <div id="textEdit" spellcheck="false" />
        <div class="w-full flow-root">
          <button class="float-right btn-primary" on:click={compile}
            >Apply Changes</button
          >
        </div>
      </div>
    </div>
  </div>
</main>
