<script lang="ts">
    import asSnake from "../templates/snake.ts?raw";
    import roRunner from "../templates/runner.rol?raw";

    import {
        Language,
        source,
        game,
        compileGame,
        getSourceOrDefault,
    } from "../utils";
    import Wasm4Game from "./Wasm4Game.svelte";
    import LzString from "lz-string";
    import Download from "./Download.svelte";

    const tryDemo = () => {
        if ($source.lang == Language.AssemblyScript) {
            $source.text = asSnake;
        } else {
            $source.text = roRunner;
        }

        compileGame();
    };
</script>

<div class="grow flex flex-col">
    <div class="w-full flow-root mb-2">
        <h2 class="float-left text-lg font-semibold">Game Preview</h2>

        <button on:click={tryDemo} class="float-right btn btn-sm">
            {$source.lang == Language.AssemblyScript
                ? "Snake Game"
                : "Platformer"}
            Demo
        </button>
    </div>

    <div class="grow rounded-box border">
        {#if $game}
            <Wasm4Game wasm={$game.wasm} />
        {/if}
    </div>

    <div class="w-full flow-root space-x-1 select-none pt-1">
        <button
            on:click={() => {
                localStorage.removeItem($source.lang);
                $source = getSourceOrDefault($source.lang);
                compileGame();
            }}
            class="float-left btn btn-sm">Reset</button
        >
        <button
            class="float-left btn btn-sm"
            on:click={() =>
                navigator.clipboard.writeText(
                    `${
                        window.location.href.split("#")[0]
                    }#${$source.lang}=${LzString.compressToEncodedURIComponent($source.text)}`,
                )}>Share</button
        >
        <div class="float-right">
            <Download />
        </div>
    </div>
</div>
