<script lang="ts">
  import { onMount } from "svelte";
  import { encode } from "./runtime/z85";
  import Wasm4Game from "./Wasm4Game.svelte";

  import mainFileTemplate from "./templates/main?raw";
  import wasm4FileTemplate from "./templates/wasm4?raw";

  import { EditorView, basicSetup } from "codemirror";
  import { javascript } from "@codemirror/lang-javascript";
  import asc from "assemblyscript/dist/asc.js";

  let view: null | EditorView = null;

  let game = false;
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
    game = false;
  
    asc
      .compileString(
        {
          "main.ts": view.state.doc.toString(),
          "wasm4.ts": wasm4FileTemplate,
        },
        {
          runtime: "incremental",
          importMemory: true,
          initialMemory: 1,
          maximumMemory: 1,
          noExportMemory: true,
          zeroFilledMemory: true,
          memoryBase: 6560,
          use: [
            "seed=wasm4/seedHandler",
            "trace=",
            "abort="
          ],
          optimizeLevel: 3,
          shrinkLevel: 2,
          converge: true,
          noAssert: true,
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

        console.log(result);

        document.getElementById("wasm4-cart-json").innerHTML = JSON.stringify({
    			WASM4_CART: encode(result.binary),
    			WASM4_CART_LENGTH: result.binary.length,
    		}).replace(/<\//g, '<\\u002F').replace(/<!/g, '<\\u0021');

        // document.getElementById("wasm4-cart-json").innerHTML = JSON.stringify({WASM4_CART:"0ax}=0rr910u88G1B>]JE/J<UE$8}Fu<qagE$8@$0ak^b0XjuPwO#U$By/YsrDI?chuiZVwO#U]vR/+200imlzGVk3wO(vaC(!0E0rSA90rSGa00SYfE/R<FV&HKt3ipuNAaAy0wDh/v0r&*.0rJ(laoiI:k)g%K0STtzaoA8O3Vk}?06{:6bMG4?la/3B1v8}{blg1fhuA>A6Hq^Z0rstAlbkom0SUK4gEhvl3j)n87a/H^k(>%dkTu8I1uMR:3QHBwlcGr{+M6{mk)P:R5cj0Ql69]Y0SUJFg^IWs*5IV=blg1jy9S=!3Yt2?070nl3KBU3bQrvnNzP1<Ttpj+oAmw*gyDnB0000Q0000&0a=dD0bITN03znN0ce6T0bRYy06{Qa0cncK0bRZB0bITX08&(c0ce6N0b}{W03Itd@4!YYjodW6gZ+Vi0000w0000}0ce6J0cncY03znz03zn-0b?&W0aC}A0bhBJ0bzMm",WASM4_CART_SIZE:390});

        game = true;
      });
  }
</script>

<main class="min-h-screen p-2 text-gray-700 bg-gray-50">
  <script id="wasm4-cart-json" type="application/json"></script>
	<script id="wasm4-disk-prefix" type="text/plain">Wasm4 Demo Game</script>
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
          {#if !game}
            <p class="text-sm">loading...</p>
          {:else}
            <Wasm4Game />
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
