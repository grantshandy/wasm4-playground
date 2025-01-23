import { Language, type Source } from "./compiler_types";
import { compileAsm, compileRol } from "./compilers"; 

self.onmessage = async (event: MessageEvent<Source>) => {
    const compiler = event.data.lang == Language.AssemblyScript ? compileAsm : compileRol;
    const result = await compiler(event.data.text);
    self.postMessage(result);
}