/// adapted from wasm4/cli/lib/bundle.js

import { type GameArtifact } from "./utils";
import { Buffer } from "buffer";

import linuxUrl from "./assets/native/wasm4-toywasm-linux.exe?url";
import windowsUrl from "./assets/native/wasm4-toywasm-windows.exe?url";
import macosUrl from "./assets/native/wasm4-toywasm-macos.exe?url";

export enum OS { Linux, Windows, MacOS }

let linuxExe: Uint8Array | null = null;
let windowsExe: Uint8Array | null = null;
let macosExe: Uint8Array | null = null;

const downloadBytes = (url: string): Promise<Uint8Array> =>
    fetch(url)
        .then((r) => r.blob())
        .then((b) => b.arrayBuffer())
        .then((a) => new Uint8Array(a));

const getNativeExe = async (os: OS): Promise<Uint8Array> => {
    switch (os) {
        case OS.Linux:
            if (!linuxExe) linuxExe = await downloadBytes(linuxUrl);
            return linuxExe;

        case OS.Windows:
            if (!windowsExe) windowsExe = await downloadBytes(windowsUrl);
            return windowsExe;

        case OS.MacOS:
            if (!macosExe) macosExe = await downloadBytes(macosUrl);
            return macosExe;

        default:
            return new Uint8Array();
    };
};

export const downloadBundle = async (os: OS, cart: GameArtifact): Promise<void> => {
    const nativeExe = await getNativeExe(os);

    // FileFooter metadata for the native runtime to read
    const metaFooter = Buffer.alloc(136);
    metaFooter.writeInt32LE(1414676803, 0); // magic
    metaFooter.write("Made with wasm4-playground", 4, 127); // title
    metaFooter.writeInt32LE(cart.wasm.length, 132); // cartLength

    const executable = Buffer.concat([nativeExe, cart.wasm, metaFooter]);

    let filename = "wasm4-game";
    if (os == OS.Windows) filename += ".exe";

    const link = document.createElement("a");
    link.download = filename;
    link.href = window.URL.createObjectURL(
        new Blob([executable], { type: "application/executable" }),
    );
    link.click();
};