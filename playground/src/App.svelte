<script lang="ts">
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";

  let playground = null;

  let dark: boolean =
    localStorage.theme === "dark" ||
    (!("theme" in localStorage) &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  $: if (dark) {
    document.documentElement.classList.add("dark");
    localStorage.theme = "dark";
  } else {
    document.documentElement.classList.remove("dark");
    localStorage.theme = "light";
  }

  onMount(() => {
    import("./Playground.svelte").then(
      (component) => (playground = component.default)
    );
  });
</script>

<button
  id="darkmode"
  class="absolute top-0 right-0 text-sm mt-1 mr-1 md:text-base md:mt-2 md:mr-2 underline"
  on:click={() => (dark = !dark)}>toggle dark mode</button
>
{#if playground}
  <div transition:fade={{ duration: 500 }} class="w-full h-full">
    <svelte:component { dark } this={playground} />
  </div>
{:else}
  <div class="h-32 w-full flex items-center justify-center">
    <div
      class="mx-auto my-auto h-10 w-10 block rounded-full border-4 border-gray-700 border-t-gray-100 animate-spin"
    />
  </div>
{/if}
