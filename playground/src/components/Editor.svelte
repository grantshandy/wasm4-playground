<script lang="ts">
    import CodeMirror from "svelte-codemirror-editor";

    import asmIcon from "../assets/asm.svg";
    import wasmIcon from "../assets/wasm.svg";
    import logoIcon from "../assets/logo.svg";

    import asHeader from "../../../wasm4/cli/assets/templates/assemblyscript/src/wasm4?raw";
    import roHeader from "../templates/wasm4.rol?raw";

    import { javascript } from "@codemirror/lang-javascript";
    import { wast } from "@codemirror/lang-wast";
    import {
        Language,
        source,
        gameResult,
        compileGame,
        getSourceOrDefault,
        isSuccess,
        isLoading,
    } from "../utils";

    enum View {
        Header = "header",
        Code = "code",
        Wat = "wat",
    }

    let view = View.Code;

    const switchLanguage = (l: Language) => {
        view = View.Code;
        $source = getSourceOrDefault(l);
        compileGame();
    };
</script>

<div class="grow flex flex-col">
    <div class="w-full flow-root space-x-2 mb-2">
        <h2 class="float-left text-lg font-semibold">Text Editor</h2>

        <div class="float-right flex space-x-1">
            {#if isLoading($gameResult)}
                <span class="loading loading-spinner loading-sm"></span>
            {/if}
            <a
                class="btn btn-sm"
                href={window.URL.createObjectURL(
                    new Blob([$source.text], { type: "text/plain" }),
                )}
                download={`wasm4-playground.${$source.lang}`}>Save</a
            >
            <button class="btn btn-sm btn-primary" on:click={compileGame}>
                Compile
            </button>
        </div>
    </div>

    <div class="grow rounded-box border overflow-y-auto h-[40vh]">
        {#if view != View.Code}
            <CodeMirror
                readonly={true}
                value={view == View.Wat
                    ? isSuccess($gameResult) && $gameResult.wat
                    : $source.lang == Language.AssemblyScript
                      ? asHeader
                      : roHeader}
                lang={view == View.Wat
                    ? wast()
                    : javascript({ typescript: true })}
            />
        {:else}
            <CodeMirror
                bind:value={$source.text}
                lang={javascript({ typescript: true })}
            />
        {/if}
    </div>

    <div class="w-full flow-root select-none">
        <div
            class="float-left flex space-x-1 pl-2 transform -translate-y-[1px]"
        >
            <button
                on:click={() => (view = View.Code)}
                class="btn btn-sm rounded-t-none border-x border-b border-t-none border-base-300"
                class:selected={view == View.Code}
                disabled={view == View.Code}
            >
                {#if $source.lang == Language.AssemblyScript}
                    <img
                        src={asmIcon}
                        style="width: 1.35rem; height: 1.35rem;"
                        alt="Assemblyscript"
                    />
                {:else}
                    <span>.ro</span>
                {/if}
            </button>

            <button
                on:click={() => (view = View.Header)}
                class="btn btn-sm rounded-t-none border-x border-b border-t-none border-base-300"
                class:selected={view == View.Header}
                disabled={view == View.Header}
                ><img
                    src={logoIcon}
                    style="width: 1.35rem; height: 1.35rem;"
                    alt="Header File"
                /></button
            >

            {#if isSuccess($gameResult) && $gameResult?.wat != null}
                <button
                    on:click={() => (view = View.Wat)}
                    class="btn btn-sm rounded-t-none border-x border-b border-t-none border-base-300"
                    class:selected={view == View.Wat}
                    disabled={view == View.Wat}
                    ><img
                        src={wasmIcon}
                        style="width: 1.35rem; height: 1.35rem;"
                        alt="Wast"
                    /></button
                >
            {/if}
        </div>

        <div class="float-right join pt-1">
            <button
                on:click={() => switchLanguage(Language.AssemblyScript)}
                disabled={$source.lang == Language.AssemblyScript}
                class="btn btn-sm join-item">AssemblyScript</button
            >
            <button
                on:click={() => switchLanguage(Language.Roland)}
                disabled={$source.lang == Language.Roland}
                class="btn btn-sm join-item">Roland</button
            >
        </div>
    </div>
</div>
