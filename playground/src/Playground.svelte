<script lang="ts">
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";

  import assemblyscriptMainFileTemplate from "../../wasm4/cli/assets/templates/assemblyscript/src/main?raw";
  import wasm4HeaderFileTemplate from "../../wasm4/cli/assets/templates/assemblyscript/src/wasm4?raw";
  import wasm4SnakeFileTemplate from "./templates/snake.ts?raw";

  import rolandMainFileTemplate from "./templates/hello.rol?raw";
  import rolandRunnerFileTemplate from "./templates/runner.rol?raw";

  import Wasm4Game from "./Wasm4Game.svelte";
  import CodeMirror from "svelte-codemirror-editor";

  import { compileAsm } from "./assemblyscript";
  import init, { compile_wasm4 as compileRol } from "rolandc_wasm";

  import { javascript } from "@codemirror/lang-javascript";
  import { rust } from "@codemirror/lang-rust";
  import LzString from "lz-string";

  enum View {
    Code,
    Wat,
  }

  enum Language {
    Assemblyscript,
    Roland,
  }

  let view: View = View.Code;
  let lang: Language = Language.Assemblyscript;
  let rolandStarted: bool = false;

  let roSource: string = "";
  let asSource: string = "";

  let wasm: Uint8Array = new Uint8Array();
  let wat: string = "";

  let error: { title: string; msg: string } | null = null;
  let gameFocused: boolean = false;
  let asSaved: boolean = localStorage.getItem("asSource") ? true : false;
  let roSaved: boolean = localStorage.getItem("roSource") ? true : false;

  onMount(() => {
    getCode();

    if (lang == Language.Roland) {
      init();
      rolandStarted = true;
    }

    updateGame();
  });

  const updateGame = async () => {
    error = null;

    if (lang == Language.Assemblyscript) {
      let res = await compileAsm({
        "main.ts": asSource,
        "wasm4.ts": wasm4HeaderFileTemplate,
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
        error = { title: "error compiling roland source", msg };
      }
      wat = "";
    }
  };

  const getCode = () => {
    const as = new URL(
      window.location.href.replace(/#/g, "?")
    ).searchParams.get("asm");
    asSource = as
      ? LzString.decompressFromEncodedURIComponent(as)
      : localStorage.getItem("asSource")
      ? LzString.decompressFromUTF16(localStorage.getItem("asSource"))
      : assemblyscriptMainFileTemplate;

    const ro = new URL(
      window.location.href.replace(/#/g, "?")
    ).searchParams.get("rol");
    roSource = ro
      ? LzString.decompressFromEncodedURIComponent(ro)
      : localStorage.getItem("roSource")
      ? LzString.decompressFromUTF16(localStorage.getItem("roSource"))
      : rolandMainFileTemplate;

    history.pushState("", document.title, window.location.pathname);
  };

  const copyShareLink = () => {
    let code: string;
    let link: string;

    if (lang == Language.Assemblyscript) {
      code = "asm";
      link = asSource;
    } else {
      code = "rol";
      link = roSource;
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
            />
          {:else}
            <CodeMirror class="h-full" value={wat} readonly={true} />
          {/if}
        {:else}
          <CodeMirror class="h-full" bind:value={roSource} lang={rust()} />
        {/if}
      </div>
      <div class="w-full flow-root select-none">
        {#if lang == Language.Assemblyscript}
          <div class="float-left inline-block pl-2">
            <button
              on:click={() => (view = View.Code)}
              class:-translate-y-0.5={view == View.Code}
              class:bg-gray-300={view != View.Code}
              class="bg-gray-50 px-2 py-1 rounded-br-md rounded-bl-md border-x-2 border-b-2 border-gray-400"
              ><img
                src="./asm.svg"
                style="width: 1.35rem; height: 1.35rem;"
                alt="Assemblyscript"
              /></button
            >
            <button
              on:click={() => (view = View.Wat)}
              class:-translate-y-0.5={view == View.Wat}
              class:bg-gray-300={view != View.Wat}
              class="bg-gray-50 px-2 py-1 rounded-br-md rounded-bl-md border-x-2 border-b-2 border-gray-400"
              ><img
                src="./wasm.svg"
                style="width: 1.35rem; height: 1.35rem;"
                alt="WAT"
              /></button
            >
          </div>
        {/if}

        <div class="float-right flex pt-1">
          <button
            on:click={() => (lang = Language.Assemblyscript)}
            class:bg-gray-100={lang != Language.Assemblyscript}
            class:font-normal={lang != Language.Assemblyscript}
            class="btn-primary py-0.5 rounded-tr-none rounded-br-none"
            >Assemblyscript</button
          >
          <button
            on:click={() => (lang = Language.Roland)}
            class:bg-gray-100={lang != Language.Roland}
            class:font-normal={lang != Language.Roland}
            class="btn-primary py-0.5 rounded-tl-none rounded-bl-none border-l-0"
            >Roland</button
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
          {#if lang == Language.Assemblyscript}
            <button
              on:click={() => {
                asSource = wasm4SnakeFileTemplate;
                updateGame();
              }}
              class="float-right h-full underline font-bold">try snake!</button
            >
          {:else}
            <button
              on:click={() => {
                roSource = rolandRunnerFileTemplate;
                updateGame();
              }}
              class="float-right h-full underline font-bold"
              >try an endless runner!</button
            >
          {/if}
        </div>
        <Wasm4Game {wasm} focused={gameFocused} />
      </div>
      <div class="w-full flow-root space-x-2 select-none">
        <div class="inline-block float-left">
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
          value={wasm4HeaderFileTemplate}
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
