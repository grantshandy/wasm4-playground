<script lang="ts">
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";

  import mainFileTemplate from "../../wasm4/cli/assets/templates/assemblyscript/src/main?raw";
  import wasm4FileTemplate from "../../wasm4/cli/assets/templates/assemblyscript/src/wasm4?raw";

  import Wasm4Game from "./Wasm4Game.svelte";
  import CodeMirror from "svelte-codemirror-editor";

  import { compileAsm } from "./assemblyscript";
  import { javascript } from "@codemirror/lang-javascript";
  import LzString from "lz-string";

  let sourceCode: string = "";
  let wasm: Uint8Array = new Uint8Array();

  let error: { title: string; msg: string } | null = null;
  let gameFocused = false;

  onMount(() => {
    sourceCode = getCode();

    const editors = document.getElementsByClassName("cm-content");
    for (let i = 0; i < editors.length; i++) {
      editors[i].setAttribute("data-enable-grammarly", "false"); // disable grammarly ;)
    }

    updateGame();
  });

  const updateGame = async () => {
    error = null;
    wasm = await compileAsm({
      "main.ts": sourceCode,
      "wasm4.ts": wasm4FileTemplate,
    }).catch((err) => (error = err));
  };

  const getCode = () => {
    const code = new URL(
      window.location.href.replace(/#/g, "?")
    ).searchParams.get("code");

    return code
      ? LzString.decompressFromEncodedURIComponent(code)
      : mainFileTemplate;
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(
      `${
        window.location.href.split("#")[0]
      }#code=${LzString.compressToEncodedURIComponent(sourceCode)}`
    );
  };

  const downloadWasm = () => {
    let blob = new Blob([wasm], { type: "application/wasm" });
    let link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = "playground";
    link.click();
  };
</script>

<div transition:fade class="w-full space-y-4">
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
  <div class="gap-4 grid grid-cols-1 md:grid-cols-2">
    <div
      class="container-box"
      on:click={() => (gameFocused = false)}
      on:keypress={() => {}}
    >
      <div class="w-full flow-root space-x-2">
        <h2 class="float-left text-lg font-semibold">Text Editor</h2>
        <div class="float-right flex gap-1">
          <button class="btn-primary" on:click={copyShareLink}
            >Copy Share Link</button
          >
          <button class="btn-primary" on:click={updateGame}
            >Apply Changes</button
          >
        </div>
      </div>
      <CodeMirror class="h-full" bind:value={sourceCode} lang={javascript()} />
    </div>
    <div
      class="container-box flex flex-col"
      on:click={() => (gameFocused = true)}
      on:keypress={() => {}}
    >
      <h2 class="float-left text-lg font-semibold">Game Preview</h2>
      <Wasm4Game {wasm} focused={gameFocused} />
      {#if wasm.length > 0}
        <div class="w-full flow-root space-x-2">
          <div class="float-right flex gap-1">
            <button class="btn-primary" on:click={downloadWasm}
              >Download WASM</button
            >
          </div>
        </div>
      {/if}
    </div>
  </div>
  <div class="lg:w-2/3 mx-auto text-center space-y-2 mt-2">
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
      <div class="text-left container-box md:w-3/4 mx-auto p-1">
        <CodeMirror
          value={wasm4FileTemplate}
          lang={javascript()}
          readonly={true}
        />
      </div>
    </div>
    <div>
      <h3 class="font-semibold text-lg">Where Is the Source Code?</h3>
      <p>
        <a href="https://github.com/grantshandy/wasm4-playground">Github Repo</a
        >
      </p>
    </div>
  </div>
</div>
