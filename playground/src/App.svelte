<script lang="ts">
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";

  let playground = null;

  onMount(() => {
    import("./Playground.svelte").then(
      (component) => (playground = component.default)
    );
  });
</script>

{#if playground}
  <div transition:fade class="w-full h-full">
    <svelte:component this={playground} />
  </div>
{:else}
  <div
    class="mx-auto my-auto h-10 w-10 block rounded-full border-4 border-gray-700 border-t-gray-100 animate-spin"
  />
{/if}
