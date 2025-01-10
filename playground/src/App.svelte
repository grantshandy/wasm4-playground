<script lang="ts">
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";

  let playground = null;

  onMount(() => {
    import("./Playground.svelte").then(
      (component) => (playground = component.default),
    );
  });
</script>

{#if playground}
  <div transition:fade={{ duration: 500 }} class="w-full h-full">
    <svelte:component this={playground} />
  </div>
{:else}
  <div class="w-full flex items-center justify-center">
    <span class="loading loading-spinner loading-lg"></span>
  </div>
{/if}
