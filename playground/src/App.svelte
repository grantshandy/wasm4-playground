<script lang="ts">
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";

  import logoIcon from "./assets/logo.svg";

  let playground = null;

  onMount(() => {
    import("./Playground.svelte").then(
      (component) => (playground = component.default),
    );
  });
</script>

<div class="min-h-screen px-2 py-4 lg:w-3/4 mx-auto space-y-3">
  <div class="lg:w-2/3 mx-auto text-center">
    <div class="flex mx-auto space-x-3 justify-center items-center">
      <h1 class="font-bold text-2xl md:text-3xl">WASM-4 Playground</h1>
      <img
        alt="wasm4 icon"
        src={logoIcon}
        style="width: 2.5rem; height: 2.5rem;"
        class="rounded-full"
      />
      <!-- style is inlined so it doesn't flash on the screen -->
    </div>
    <p>
      Create and share <a href="https://wasm4.org">WASM-4</a> retro games in your
      web browser.
    </p>
  </div>

  <hr class="my-9" />

  {#if playground}
    <div transition:fade={{ duration: 500 }} class="w-full h-full">
      <svelte:component this={playground} />
    </div>
  {:else}
    <div class="w-full flex items-center justify-center">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
  {/if}

  <hr class="my-9" />

  <div class="lg:w-2/3 mx-auto text-center space-y-4">
    <h1 class="font-bold text-4xl">FAQ</h1>

    <div class="space-y-2">
      <h2 class="font-semibold text-2xl">What is WASM-4?</h2>
      <p>
        <a href="https://wasm4.org">WASM-4</a> is a retro game "console" that
        runs its games as
        <a href="https://webassembly.org/">webassembly</a> files which allows games
        to be written in almost any programming language.
      </p>
    </div>

    <div class="space-y-2">
      <h2 class="font-semibold text-2xl">What programming language is this?</h2>

      <div class="grid grid-cols-2 gap-2">
        <div class="p-2 rounded-box bg-base-200 border">
          <h3 class="text-xl font-semibold">
            <a href="https://assemblyscript.org">AssemblyScript</a>
          </h3>
          <p>
            A compiled variant of <a href="https://typescriptlang.org"
              >Typescript</a
            > that targets WebAssembly.
          </p>
        </div>

        <div class="p-2 rounded-box bg-base-200 border">
          <h3 class="text-xl font-semibold">
            <a href="https://github.com/DenialAdams/roland">Roland</a>
          </h3>
          <p>
            Roland is a work-in-progress programming language similar to Rust.
          </p>
        </div>
      </div>
    </div>

    <div class="space-y-2">
      <h2 class="font-semibold text-2xl">
        What functions do I have access to?
      </h2>
      <p>
        Programs are compiled with the standard library and link against
        WASM-4's header file, which you can view by clicking the
        <img
          src={logoIcon}
          style="height: 1.5rem; display: inline;"
          alt="wasm4 icon"
        />
        icon.
      </p>
    </div>

    <p>
      <a href="https://buymeacoffee.com/granthandy">Donate</a> &#8729;
      <a href="https://github.com/grantshandy/wasm4-playground">Source</a>
    </p>
    <p class="text-sm italic">
      <a href="https://github.com/aduros/wasm4/blob/main/LICENSE.txt">
        WASM-4 Logo and Runtime &copy; Bruno Garcia
      </a>
      &#8729;
      <a
        href="https://github.com/grantshandy/wasm4-playground/blob/main/LICENSE"
      >
        Site and Editor &copy; Grant Handy
      </a>
    </p>
  </div>
</div>
