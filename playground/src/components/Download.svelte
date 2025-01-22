<script lang="ts">
    import windowsIcon from "../assets/windows.svg";
    import macosIcon from "../assets/macos.svg";
    import linuxIcon from "../assets/linux.svg";
    import htmlIcon from "../assets/html5.svg";

    import { game } from "../utils";
    import { OS, downloadBundle } from "../bundle";
</script>

<div class="float-right flex items-center space-x-3">
    {#if $game != null && $game.wasm.length > 0}
        <span>Download: </span>
        <div class="join">
            <button
                on:click={() => downloadBundle(OS.Windows, $game)}
                class="join-item btn btn-sm"
                aria-label="Download Windows Executable"
            >
                <img src={windowsIcon} alt="icon" class="download-icon" />
            </button>
            <button
                on:click={() => downloadBundle(OS.MacOS, $game)}
                class="join-item btn btn-sm"
                aria-label="Download MacOS Executable"
            >
                <img src={macosIcon} alt="icon" class="download-icon" />
            </button>
            <button
                on:click={() => downloadBundle(OS.Linux, $game)}
                class="join-item btn btn-sm"
                aria-label="Download Linux Executable"
            >
                <img src={linuxIcon} alt="icon" class="download-icon" />
            </button>
            <!-- <button
                on:click={() => downloadBundle(OS.Html5, $game)}
                class="join-item btn btn-sm"
                aria-label="Download Self Contained HTML Page"
            >
                <img src={htmlIcon} alt="icon" class="download-icon" />
            </button> -->
        </div>
    {/if}
</div>

<style lang="scss">
    .download-icon {
        @apply w-4 h-4;
    }
</style>
