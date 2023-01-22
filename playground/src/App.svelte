<script lang="ts">
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";

  let playground = null;

  onMount(() => {
    playground = import("./Playground.svelte");
  });
</script>

<main class="min-h-screen px-2 py-8 lg:w-3/4 xl:w-1/2 mx-auto space-y-3">
  <div class="lg:w-2/3 mx-auto text-center">
    <h1 class="font-bold text-2xl md:text-3xl">WASM-4 Playground</h1>
    <p>
      Create <span class="line-through">and share</span> (soon!)
      <a href="https://wasm4.org">WASM-4</a>
      retro games in your web browser.
    </p>
  </div>
  {#if playground}
    {#await playground then { default: Playground }}
      <Playground />
    {/await}
  {:else}
    <div transition:fade class="w-full h-20 grid place-items-center">
      <div
        class="h-10 w-10 block rounded-full border-4 border-gray-700 border-t-gray-100 animate-spin"
      />
    </div>
  {/if}
  <div class="lg:w-2/3 mx-auto text-center space-y-2">
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
