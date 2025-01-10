import LzString from "lz-string";
import { writable, type Writable } from "svelte/store";
import asc from "assemblyscript/dist/asc.js";
import init, { compile_wasm4 as compileRol } from "rolandc_wasm";

import roMain from "./templates/hello.rol?raw"
import asMain from "../../wasm4/cli/assets/templates/assemblyscript/src/main?raw";
import asHeader from "../../wasm4/cli/assets/templates/assemblyscript/src/wasm4?raw";

export let error: Writable<string | null> = writable(null);

export type CompiledGame = { wasm: Uint8Array; wat: string | null; };
export const game: Writable<CompiledGame | null> = writable(null);

export enum Language { AssemblyScript = "ts", Roland = "rol", };
export type Source = { text: string; lang: Language; };

export const getSourceOrDefault = (lang?: Language): Source => {
    const sp = new URL(window.location.href.replace(/#/g, "?")).searchParams;

    if (!lang) {
        lang = sp.get(Language.Roland)
            ? Language.Roland
            : Language.AssemblyScript;
    }

    const text: string =
        LzString.decompressFromEncodedURIComponent(sp.get(lang)) ||
        LzString.decompressFromBase64(localStorage.getItem(lang)) ||
        (lang == Language.AssemblyScript ? asMain : roMain);

    return { lang, text };
}

export const source: Writable<Source> = writable(getSourceOrDefault());

source.subscribe((src) => localStorage.setItem(src.lang, LzString.compressToBase64(src.text)));

/// Compiles language-generic source code into wasm and .wat.
/// Errors are written to the `error` store.
export const compileGame = async (): Promise<void> => {
    let src: Source;
    source.update((s) => {
        src = s;
        return s;
    });

    let newGame: CompiledGame | null;

    if (src.lang == Language.AssemblyScript) {
        const asm = await compileAsm(src.text);

        if (typeof (asm) == "string") {
            error.set(asm);
            newGame = null;
        } else {
            newGame = asm;
        }
    } else {
        // TODO: preload roland init
        await init();

        try {
            newGame = {
                wasm: compileRol(src.text),
                wat: null
            };
        } catch (msg) {
            error.set(`Error compiling roland: '${msg}''`);
            newGame = null;
        }
    }

    game.update((_) => newGame);
};

const compileAsm = async (srcText: string): Promise<CompiledGame | string> => asc
    .compileString(
        {
            "main.ts": srcText,
            "wasm4.ts": asHeader
        },
        {
            runtime: "incremental",
            importMemory: true,
            initialMemory: 1,
            maximumMemory: 1,
            noExportMemory: true,
            zeroFilledMemory: true,
            memoryBase: 6560,
            use: ["seed=wasm4/seedHandler", "trace=", "abort="],
            optimizeLevel: 3,
            shrinkLevel: 2,
            converge: true,
            noAssert: true,
            debug: false,
        },
    )
    .then((result: any) => {
        if (result.error) {
            return `${result.error.message}: ${result.stderr.toString()}`;
        }

        return { wasm: result.binary, wat: result.text };
    });