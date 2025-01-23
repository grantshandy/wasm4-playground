export type GameArtifact = {
    wasm: Uint8Array;
    wat: string | null;
};

export type ErrorMessage = string;
export type Loading = boolean;
export type CompilationState = GameArtifact | ErrorMessage | Loading | null;

export enum Language {
    AssemblyScript = "ts",
    Roland = "rol",
};

export type Source = {
    text: string;
    lang: Language;
};
