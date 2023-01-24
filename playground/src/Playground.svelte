<script lang="ts">
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";

  import mainFileTemplate from "../../wasm4/cli/assets/templates/assemblyscript/src/main?raw";
  import wasm4FileTemplate from "../../wasm4/cli/assets/templates/assemblyscript/src/wasm4?raw";
  import snakeFileTemplate from "./templates/snake.ts?raw";

  import Wasm4Game from "./Wasm4Game.svelte";
  import CodeMirror from "svelte-codemirror-editor";

  import { compileAsm } from "./assemblyscript";

  import { javascript } from "@codemirror/lang-javascript";
  import LzString from "lz-string";

  enum View {
    Code,
    Wat,
  }

  let mounted: boolean = false;
  let view: View = View.Code;

  $: if (mounted) {
    let codeBtn = document.getElementById("code");
    let watBtn = document.getElementById("wat");

    if (view == View.Code) {
      if (!codeBtn.classList.contains("-translate-y-0.5")) {
        watBtn.classList.remove("-translate-y-0.5");
        watBtn.classList.add("bg-gray-300");

        codeBtn.classList.add("-translate-y-0.5");
        codeBtn.classList.remove("bg-gray-300");
      }
    } else {
      if (!watBtn.classList.contains("-translate-y-0.5")) {
        codeBtn.classList.remove("-translate-y-0.5");
        codeBtn.classList.add("bg-gray-300");

        watBtn.classList.add("-translate-y-0.5");
        watBtn.classList.remove("bg-gray-300");
      }
    }
  }

  let sourceCode: string = "";

  let wasm: Uint8Array = new Uint8Array();
  let wat: string = "";

  let error: { title: string; msg: string } | null = null;
  let gameFocused: boolean = false;
  let saved: boolean = localStorage.getItem("sourceCode") ? true : false;

  onMount(() => {
    mounted = true;

    getCode();
    updateGame();
  });

  const updateGame = async () => {
    error = null;

    let res = await compileAsm({
      "main.ts": sourceCode,
      "wasm4.ts": wasm4FileTemplate,
    }).catch((err) => (error = err));
    wasm = res.wasm;
    wat = res.wat;
  };

  const getCode = () => {
    const as = new URL(
      window.location.href.replace(/#/g, "?")
    ).searchParams.get("asm");
    history.pushState("", document.title, window.location.pathname);
    sourceCode = as
      ? LzString.decompressFromEncodedURIComponent(as)
      : localStorage.getItem("sourceCode")
      ? localStorage.getItem("sourceCode")
      : mainFileTemplate;
  };

  const copyShareLink = () => {
    let code: string = sourceCode;
    let link: string = "asm";

    navigator.clipboard.writeText(
      `${
        window.location.href.split("#")[0]
      }#${link}=${LzString.compressToEncodedURIComponent(code)}`
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
    <div class="flex flex-col">
      <div
        class="grow container-box"
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
        {#if view == View.Code}
          <CodeMirror
            class="h-full"
            bind:value={sourceCode}
            lang={javascript({ typescript: true })}
          />
        {:else}
          <CodeMirror class="h-full" value={wat} readonly={true} />
        {/if}
      </div>
      <div class="w-full flow-root select-none">
        <div class="float-left inline-block pl-2">
          <button
            on:click={() => (view = View.Code)}
            id="code"
            class="bg-gray-50 px-2 py-1 rounded-br-md rounded-bl-md border-x-2 border-b-2 border-gray-400 -translate-y-0.5"
            ><img
              src="/asm.svg"
              style="width: 1.35rem; height: 1.35rem;"
              alt="Assemblyscript"
            /></button
          >
          <button
            on:click={() => (view = View.Wat)}
            id="wat"
            class="bg-gray-50 px-2 py-1 rounded-br-md rounded-bl-md border-x-2 border-b-2 border-gray-400 bg-gray-300"
            ><img
              src="/wasm.svg"
              style="width: 1.35rem; height: 1.35rem;"
              alt="WAT"
            /></button
          >
        </div>
      </div>
    </div>
    <div class="flex flex-col space-y-1">
      <div
        class="grow container-box"
        on:click={() => (gameFocused = true)}
        on:keypress={() => {}}
      >
        <div class="w-full flow-root">
          <h2 class="float-left text-lg font-semibold">Game Preview</h2>
          <button
            on:click={() => {
              sourceCode = snakeFileTemplate;
              updateGame();
            }}
            class="float-right h-full underline font-bold">try snake!</button
          >
        </div>
        <Wasm4Game {wasm} focused={gameFocused} />
      </div>
      {#if wasm && wasm.length > 0}
        <div class="w-full flow-root space-x-2 select-none">
          <div class="inline-block float-right">
            {#if saved}
              <button
                on:click={() => {
                  localStorage.removeItem("sourceCode");
                  saved = false;
                }}
                class="btn-primary py-0.5">Remove Save</button
              >
            {/if}
            <button
              on:click={() => {
                localStorage.setItem("sourceCode", sourceCode);
                saved = true;
              }}
              class="btn-primary py-0.5">Save Changes</button
            >
            <button class="btn-primary py-0.5" on:click={downloadWasm}
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
      <div class="text-left container-box mx-auto p-1">
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
