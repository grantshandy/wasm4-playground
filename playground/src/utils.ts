import LzString from "lz-string";
import { writable, type Writable } from "svelte/store";
import CompilerWorker from "./worker?worker";

import roMain from "./templates/hello.rol?raw"
import asMain from "../../wasm4/cli/assets/templates/assemblyscript/src/main?raw";

import { type CompilationState, type ErrorMessage, type GameArtifact, Language, type Loading, type Source } from "./compiler_types";
export * from "./compiler_types";

// export type { CompilationState, ErrorMessage, GameArtifact, Loading, Source };

export const isError = (g: CompilationState): g is ErrorMessage =>
    g != null && typeof (g) == "string";
export const isSuccess = (g: CompilationState): g is GameArtifact =>
    g != null && typeof (g) == "object" && g.wasm.length > 0;
export const isLoading = (g: CompilationState): g is Loading =>
    g != null && typeof (g) == "boolean" && g == true;

export const gameResult: Writable<CompilationState> = writable(null);

const compiler = new CompilerWorker();

/// Compiles language-generic source code into wasm and .wat.
/// Errors are written to the `error` store.
export const compileGame = async (): Promise<void> => {
    let src: Source;
    source.update((s) => {
        src = s;
        return s;
    });

    // start "loading"
    gameResult.update((_) => true);

    const p = new Promise<CompilationState>((resolve) => {
        compiler.onmessage = (ev) => resolve(ev.data);
    });
    compiler.postMessage(src);
    const r = await p;

    gameResult.update((_) => r);
};


/**
 * Gets the current source code from (in order of priority)
 *  - Share URL
 *  - Local Storage (previous visits)
 *  - Default hello world for param lang
 */
export const getSourceOrDefault = (lang?: Language): Source => {
    const sp = new URL(window.location.href.replace(/#/g, "?")).searchParams;

    if (!lang) lang = sp.get(Language.Roland)
        ? Language.Roland
        : Language.AssemblyScript;

    const text: string =
        LzString.decompressFromEncodedURIComponent(sp.get(lang)) ||
        LzString.decompressFromBase64(localStorage.getItem(lang)) ||
        (lang == Language.AssemblyScript ? asMain : roMain);

    return { lang, text };
}

export const source: Writable<Source> = writable(getSourceOrDefault());

source.subscribe((src) => localStorage.setItem(src.lang, LzString.compressToBase64(src.text)));