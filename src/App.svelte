<script lang="ts">
  import { onMount } from "svelte";
  import Wasm4Game from "./Wasm4Game.svelte";

  import mainFileTemplate from "./templates/main?raw";
  import wasm4FileTemplate from "./templates/wasm4?raw";

  import { compileAsm } from "./asm";
  import CodeMirror from "svelte-codemirror-editor";
  import { javascript } from "@codemirror/lang-javascript";

  let viewGame: boolean = false;

  let sourceCode: string = mainFileTemplate;
  let wasm: Uint8Array = new Uint8Array();

  let error: { title: string; msg: string } | null = null;

  let sources: { [key: string]: string } = {
    "main.ts": sourceCode,
    "wasm4.ts": wasm4FileTemplate,
  };

  $: {
    sources["main.ts"] = sourceCode;
  }

  onMount(() => {
    document
      .getElementsByClassName("cm-content")[0]
      .setAttribute("data-enable-grammarly", "false"); // disable grammarly ;)
    updateGame();
  });

  async function updateGame() {
    error = null;
    viewGame = false;
    wasm = await compileAsm(sources).catch((err) => (error = err));
    viewGame = true;
  }
</script>

<main class="min-h-screen p-2 text-gray-700 bg-gray-50 space-y-3">
  <div class="md:w-2/3 lg:w-1/2 mx-auto space-y-2">
    <h1 class="font-bold text-2xl">WASM-4 Playground</h1>
    <p class="text-sm">
      Create and share <a href="https://wasm4.org" class="underline">wasm-4</a> retro
      games in your web browser.
    </p>
  </div>
  <div class="w-full gap-2 grid grid-cols-1 md:grid-cols-2">
    <div class="container-box">
      <div class="w-full flow-root space-x-2">
        <h2 class="float-left text-lg font-semibold">Text Editor</h2>
        <button class="float-right btn-primary" on:click={updateGame}
          >Apply Changes</button
        >
      </div>
      <CodeMirror class="h-full" bind:value={sourceCode} lang={javascript()} />
    </div>
    <div class="container-box flex flex-col">
      <div class="w-full flow-root space-x-2">
        <h2 class="float-left text-lg font-semibold">Game Preview</h2>
        <button class="float-right btn-primary">Download</button>
        <button class="float-right btn-primary">Share</button>
      </div>
      <div class="grow rounded-md border-2 border-gray-400">
        {#if viewGame}
          <Wasm4Game />
        {:else}
          <p class="text-sm m-3">loading...</p>
        {/if}
      </div>
    </div>
  </div>
  <div class="md:w-2/3 lg:w-1/2 mx-auto space-y-2">
    {#if error}
      <div class="rounded-md p-2 space-y-1 bg-red-700 text-gray-100">
        <div class="w-full select-none items-center flex">
          <h2 class="font-bold text-xl">{error.title}:</h2>
          <button
            class="ml-auto rounded-md font-bold hover:bg-red-800 border-2 border-bg-red-900 px-2 py-1"
            on:click={() => (error = null)}>Close</button
          >
        </div>
        <hr />
        <pre class="text-sm">{error.msg}</pre>
      </div>
    {/if}
  </div>
</main>
