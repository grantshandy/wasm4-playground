import asc from "assemblyscript/dist/asc.js";

export async function compileAsm(
  sources: { [key: string]: string },
): Promise<Uint8Array> {
  return asc
    .compileString(
      sources,
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
      },
    )
    .then((result: any) => {
      if (result.error) {
        const error = { title: "", msg: "" };

        error.title = `${result.error.message}`;

        if (result.stderr) {
          error.msg += `${result.stderr.toString()}\n`;
        }

        throw error;
      }

      return result.binary;
    });
}
