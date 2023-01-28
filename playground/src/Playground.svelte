<script lang="ts">
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";

  import assemblyscriptMainFile from "../../wasm4/cli/assets/templates/assemblyscript/src/main?raw";
  import assemblyscriptHeaderFile from "../../wasm4/cli/assets/templates/assemblyscript/src/wasm4?raw";
  import assemblyscriptSnakeFile from "./templates/snake.ts?raw";
  import rolandMainFile from "./templates/hello.rol?raw";
  import rolandHeaderFile from "./templates/wasm4.rol?raw";
  import rolandRunnerFile from "./templates/runner.rol?raw";

  import Wasm4Game from "./Wasm4Game.svelte";
  import CodeMirror from "svelte-codemirror-editor";

  import { compileAsm } from "./assemblyscript";
  import init, { compile_wasm4 as compileRol } from "rolandc_wasm";

  import { javascript } from "@codemirror/lang-javascript";
  import { wast } from "@codemirror/lang-wast";
  import { gruvboxDark } from "cm6-theme-gruvbox-dark";
  import { gruvboxLight } from "cm6-theme-gruvbox-light";

  import LzString from "lz-string";

  enum View {
    Code = "code",
    Wat = "wat",
  }

  enum Language {
    Assemblyscript = "asm",
    Roland = "rol",
  }

  export let dark: boolean;

  let view: View = (localStorage.getItem("view") as View) || View.Code;
  $: localStorage.setItem("view", view.toString());
  let lang: Language =
    (localStorage.getItem("lang") as Language) || Language.Assemblyscript;
  $: localStorage.setItem("lang", lang.toString());

  let rolandStarted: boolean = false;
  let firstCompile: boolean = false;

  let roSource: string = "";
  let asSource: string = "";

  let wasm: Uint8Array = new Uint8Array();
  let wat: string = "";

  let error: { title: string; msg: string } | null = null;
  let asSaved: boolean = localStorage.getItem("asSource") ? true : false;
  let roSaved: boolean = localStorage.getItem("roSource") ? true : false;

  onMount(() => {
    getCode();
    updateGame();
  });

  const updateGame = async () => {
    error = null;

    if (lang == Language.Assemblyscript) {
      let res = await compileAsm({
        "main.ts": asSource,
        "wasm4.ts": assemblyscriptHeaderFile,
      }).catch((err) => (error = err));
      wasm = res.wasm;
      wat = res.wat;
    } else {
      if (!rolandStarted) {
        await init();
      }
      try {
        wasm = compileRol(roSource);
      } catch (msg) {
        error = { title: "error compiling roland", msg };
      }
      wat = "";
    }

    if (!firstCompile) {
      firstCompile = true;
    }
  };

  const getCode = () => {
    const as = new URL(
      window.location.href.replace(/#/g, "?")
    ).searchParams.get("asm");
    asSource =
      LzString.decompressFromEncodedURIComponent(as) ||
      LzString.decompressFromUTF16(localStorage.getItem("asSource")) ||
      assemblyscriptMainFile;

    if (as) {
      lang = Language.Assemblyscript;
    }

    const ro = new URL(
      window.location.href.replace(/#/g, "?")
    ).searchParams.get("rol");
    roSource =
      LzString.decompressFromEncodedURIComponent(ro) ||
      LzString.decompressFromUTF16(localStorage.getItem("roSource")) ||
      rolandMainFile;

    if (ro) {
      lang = Language.Roland;
    }

    history.pushState("", document.title, window.location.pathname);
  };

  const copyShareLink = () => {
    let code: string;
    let link: string;

    if (lang == Language.Assemblyscript) {
      link = "asm";
      code = asSource;
    } else {
      link = "rol";
      code = roSource;
    }

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

<div transition:fade class="w-full space-y-6">
  {#if error}
    <div class="rounded-md p-2 space-y-1 bg-red text-bg">
      <div class="w-full select-none items-center flex">
        <h2 class="font-bold text-xl">{error.title}:</h2>
        <button
          class="ml-auto rounded-md font-bold hover:bg-red-800 border-2 border-red-dim px-2 py-1"
          on:click={() => (error = null)}>Close</button
        >
      </div>
      <hr />
      <pre class="text-sm">{error.msg}</pre>
    </div>
  {/if}
  <div class="gap-4 grid grid-cols-1 md:grid-cols-2">
    <div class="flex flex-col">
      <div class="grow container-box">
        <div class="w-full flow-root space-x-2">
          <h2 class="float-left text-lg font-semibold">Text Editor</h2>
          <div class="float-right flex gap-1">
            <button class="btn-primary" on:click={updateGame}
              >Apply Changes</button
            >
          </div>
        </div>
        {#if lang == Language.Assemblyscript}
          {#if view == View.Code}
            <CodeMirror
              class="h-full"
              bind:value={asSource}
              lang={javascript({ typescript: true })}
              theme={dark ? gruvboxDark : gruvboxLight}
            />
          {:else}
            <CodeMirror
              class="h-full"
              value={wat}
              lang={wast()}
              readonly={true}
              theme={dark ? gruvboxDark : gruvboxLight}
            />
          {/if}
        {:else}
          <CodeMirror
            class="h-full"
            bind:value={roSource}
            lang={javascript({ typescript: true })}
            theme={dark ? gruvboxDark : gruvboxLight}
          />
        {/if}
      </div>
      <div class="w-full flow-root select-none">
        {#if lang == Language.Assemblyscript}
          <div class="float-left inline-block pl-2">
            <button
              on:click={() => (view = View.Code)}
              class="bg-gray-50 px-2 py-1 rounded-br-md rounded-bl-md bg-bg1 dark:bg-bg1-dark border-x-2 border-b-2 border-bg2 dark:border-bg2-dark"
              class:selected={view == View.Code}
              ><img
                src="./asm.svg"
                style="width: 1.35rem; height: 1.35rem;"
                alt="Assemblyscript"
              /></button
            >
            <button
              on:click={() => (view = View.Wat)}
              class="bg-gray-50 px-2 py-1 rounded-br-md rounded-bl-md bg-bg1 dark:bg-bg1-dark border-x-2 border-b-2 border-bg2 dark:border-bg2-dark"
              class:selected={view == View.Wat}
              ><img
                src="./wasm.svg"
                style="width: 1.35rem; height: 1.35rem;"
                alt="Wast"
              /></button
            >
          </div>
        {/if}
        <div class="float-right flex pt-1">
          <button
            on:click={() => {
              lang = Language.Assemblyscript;
              updateGame();
            }}
            class:bg-gray-100={lang != Language.Assemblyscript}
            class:font-normal={lang != Language.Assemblyscript}
            class="btn-primary py-0.5 rounded-tr-none rounded-br-none"
            >Assemblyscript</button
          >
          <button
            on:click={() => {
              lang = Language.Roland;
              updateGame();
            }}
            class:bg-gray-100={lang != Language.Roland}
            class:font-normal={lang != Language.Roland}
            class="btn-primary py-0.5 rounded-tl-none rounded-bl-none border-l-0"
            >Roland</button
          >
        </div>
      </div>
    </div>
    <div class="flex flex-col space-y-1">
      <div class="grow container-box">
        <div class="w-full flow-root">
          <h2 class="float-left text-lg font-semibold">Game Preview</h2>
          {#if lang == Language.Assemblyscript}
            <button
              on:click={() => {
                asSource = assemblyscriptSnakeFile;
                updateGame();
              }}
              class="float-right h-full underline font-bold">try snake!</button
            >
          {:else}
            <button
              on:click={() => {
                roSource = rolandRunnerFile;
                updateGame();
              }}
              class="float-right h-full underline font-bold"
              >try a platformer!</button
            >
          {/if}
        </div>
        {#if firstCompile}
          <Wasm4Game {wasm} />
        {/if}
      </div>
      <div class="w-full flow-root space-x-2 select-none">
        <div class="inline-block float-left">
          <button
            on:click={() => {
              if (lang == Language.Assemblyscript) {
                localStorage.setItem(
                  "asSource",
                  LzString.compressToUTF16(asSource)
                );
                asSaved = true;
              } else {
                localStorage.setItem(
                  "roSource",
                  LzString.compressToUTF16(roSource)
                );
                roSaved = true;
              }
            }}
            class="btn-primary py-0.5">Save Changes</button
          >
          {#if lang == Language.Assemblyscript ? asSaved : roSaved}
            <button
              on:click={() => {
                if (lang == Language.Assemblyscript) {
                  localStorage.removeItem("asSource");
                  asSaved = false;
                } else {
                  localStorage.removeItem("roSource");
                  roSaved = false;
                }
              }}
              class="btn-primary py-0.5">Remove Save</button
            >
          {/if}
        </div>
        <div class="inline-block float-right">
          <button class="btn-primary py-0.5" on:click={copyShareLink}
            >Copy Share Link</button
          >
          {#if wasm && wasm.length > 0}
            <button class="btn-primary py-0.5" on:click={downloadWasm}
              >Download WASM</button
            >
          {/if}
        </div>
      </div>
    </div>
  </div>
  <div class="lg:w-2/3 mx-auto text-center space-y-4">
    <h1 class="font-bold text-4xl">FAQ</h1>
    <div class="space-y-2">
      <h2 class="font-semibold text-2xl">What is WASM-4?</h2>
      <p>
        <a href="https://wasm4.org">WASM-4</a> is a retro game "console" that
        runs its games as <a href="https://webassembly.org/">webassembly</a> files
        which allows games to be written in almost any programming language.
      </p>
    </div>
    <div class="space-y-2">
      <h2 class="font-semibold text-2xl">What Language is This?</h2>
      <div class="w-full grid grid-cols-2 gap-2">
        <div
          class="p-2 rounded-md bg-gray-300 border-2 border-bg4 dark:border-bg4-dark"
          class:lang-selected={lang == Language.Assemblyscript}
        >
          <h3 class="text-xl font-semibold">
            <a href="https://assemblyscript.org">AssemblyScript</a>
          </h3>
          <p>
            AssemblyScript is a variant of
            <a href="https://typescriptlang.org">typescript</a> which is compiled
            to webassembly.
          </p>
        </div>
        <div
          class="p-2 rounded-md bg-gray-300 border-2 border-bg4 dark:border-bg4-dark"
          class:lang-selected={lang == Language.Roland}
        >
          <h3 class="text-xl font-semibold">
            <a href="https://github.com/DenialAdams/roland">Roland</a>
          </h3>
          <p>Roland is a work-in-progress programming language.</p>
        </div>
      </div>
    </div>
    <div class="space-y-2">
      <h2 class="font-semibold text-2xl">
        What Functions Do I Have Access To?
      </h2>
      <div class="text-left container-box mx-auto p-1 shadow-xl">
        <CodeMirror
          value={lang == Language.Assemblyscript
            ? assemblyscriptHeaderFile
            : rolandHeaderFile}
          lang={javascript({ typescript: true })}
          readonly={true}
          theme={dark ? gruvboxDark : gruvboxLight}
        />
      </div>
    </div>
    <div class="space-y-2">
      <h2 class="font-semibold text-lg">Where Is the Source Code?</h2>
      <p>
        <a href="https://github.com/grantshandy/wasm4-playground">Github Repo</a
        >
      </p>
    </div>
  </div>
</div>
