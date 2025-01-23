import initRoland, { compile_wasm4 } from "rolandc_wasm";
import asHeader from "../../wasm4/cli/assets/templates/assemblyscript/src/wasm4?raw";

import { type GameArtifact } from "./compiler_types";

export const compileAsm = async (srcText: string): Promise<GameArtifact | string> =>
    import("assemblyscript/dist/asc")
        .then((asc) => asc.compileString(
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
                use: ["seed=wasm4/seedHandler", "abort=wasm4/abortHandler", "trace="],
                optimizeLevel: 3,
                shrinkLevel: 2,
                converge: true,
                noAssert: true,
                debug: false,

            },
        ))
        .then((result: any) => {
            if (result.error) {
                return `${result.error.message}: ${result.stderr.toString()}`;
            }

            return { wasm: result.binary, wat: result.text };
        });


let init = false;
export const compileRol = async (srcText: string): Promise<GameArtifact | string> => {
    if (!init) {
        await initRoland();
        init = true;
    }

    try {
        return {
            wasm: compile_wasm4(srcText),
            wat: null,
        };
    } catch (msg) {
        return `Error compiling roland: '${msg}''`;
    }
};