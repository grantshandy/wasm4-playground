<script lang="ts">
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";

  import { compileGame, gameResult, isError } from "./utils";

  import Preview from "./components/Preview.svelte";
  import Editor from "./components/Editor.svelte";

  onMount(() => {
    compileGame();
  });
</script>

<div transition:fade class="w-full space-y-6">
  {#if isError($gameResult)}
    <div role="alert" class="alert alert-error">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6 shrink-0 stroke-current"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <pre>{$gameResult}</pre>
    </div>
  {/if}

  <div class="gap-4 grid grid-cols-1 md:grid-cols-2">
    <Editor />
    <Preview />
  </div>

</div>
