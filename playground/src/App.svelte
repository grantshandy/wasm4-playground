<script lang="ts">
  import { onMount } from "svelte";
  import mainFileTemplate from "../../wasm4/cli/assets/templates/assemblyscript/src/main?raw";
  import wasm4FileTemplate from "../../wasm4/cli/assets/templates/assemblyscript/src/wasm4?raw";
  import snakeFileTemplate from "./templates/snake?raw";

  import Wasm4Game from "./Wasm4Game.svelte";
  import CodeMirror from "svelte-codemirror-editor";

  import { compileAsm } from "./asm";
  import { javascript } from "@codemirror/lang-javascript";

  let sourceCode: string = mainFileTemplate;
  let wasm: Uint8Array = new Uint8Array();

  let error: { title: string; msg: string } | null = null;
  let gameFocused = false;

  onMount(() => {
    document
      .getElementsByClassName("cm-content")[0]
      .setAttribute("data-enable-grammarly", "false"); // disable grammarly ;)
    updateGame();
  });

  async function updateGame() {
    error = null;
    wasm = await compileAsm({
      "main.ts": sourceCode,
      "wasm4.ts": wasm4FileTemplate,
    }).catch((err) => (error = err));
  }
</script>

<main class="min-h-screen px-2 py-8 lg:w-3/4 xl:w-1/2 mx-auto space-y-3">
  <div class="lg:w-2/3 mx-auto text-center">
    <h1 class="font-bold text-2xl md:text-3xl">WASM-4 Playground</h1>
    <p>
      Create <span class="line-through">and share</span> (soon!)
      <a href="https://wasm4.org">WASM-4</a>
      retro games in your web browser.
    </p>
    <p>
      <button
        class="underline font-bold"
        on:click={() => {
          sourceCode = snakeFileTemplate;
          updateGame();
        }}>try out snake!</button
      >
    </p>
  </div>
  <div class="w-full gap-4 grid grid-cols-1 md:grid-cols-2">
    <div
      class="container-box"
      on:click={() => (gameFocused = false)}
      on:keypress={() => {}}
    >
      <div class="w-full flow-root space-x-2">
        <h2 class="float-left text-lg font-semibold">Text Editor</h2>
        <button class="float-right btn-primary" on:click={updateGame}
          >Apply Changes</button
        >
      </div>
      <CodeMirror
        class="h-full"
        bind:value={sourceCode}
        lang={javascript()}
        styles={{ "&": { height: "45rem" } }}
      />
    </div>
    <div
      class="container-box flex flex-col"
      on:click={() => (gameFocused = true)}
      on:keypress={() => {}}
    >
      <div class="w-full flow-root space-x-2">
        <h2 class="float-left text-lg font-semibold">Game Preview</h2>
      </div>
      <Wasm4Game {wasm} focused={gameFocused} />
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
  </div>
  <div class="md:w-2/3 lg:w-1/2 mx-auto text-center space-y-2">
    <h1 class="font-bold text-2xl md:text-3xl">FAQ</h1>
    <div>
      <h3 class="font-semibold text-lg">What is WASM-4?</h3>
      <p>
        <a href="https://wasm4.org">WASM-4</a> is a retro game "console" that
        runs its games as <a href="https://webassembly.org/">webassembly</a> files,
        which allows games to be written in almost any programming language.
      </p>
    </div>
    <div>
      <h3 class="font-semibold text-lg">What Language is This?</h3>
      <p>
        Programs on this site are written in <a
          href="https://assemblyscript.org">assemblyscript</a
        >, a variant of
        <a href="https://typescriptlang.org">typescript</a> (itself is variant of
        javascript), that is compiled to webassembly.
      </p>
    </div>
    <div>
      <h3 class="font-semibold text-lg">What Functions Do I Have Access To?</h3>
      <p>
        See the WASM-4 <a href="https://wasm4.org/docs/reference/functions"
          >functions reference</a
        >
        and
        <a href="https://wasm4.org/docs/reference/memory"
          >memory map reference</a
        >.
      </p>
    </div>
    <div>
      <h3 class="font-semibold text-lg">Where Is the Source Code?</h3>
      <p>
        <a href="https://github.com/grantshandy/wasm4-playground">Github Repo</a
        >
      </p>
    </div>
  </div>
</main>
