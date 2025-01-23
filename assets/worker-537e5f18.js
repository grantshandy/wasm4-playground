var v=(n=>(n.AssemblyScript="ts",n.Roland="rol",n))(v||{});let s;const A=new TextDecoder("utf-8",{ignoreBOM:!0,fatal:!0});A.decode();let x=new Uint8Array;function w(){return x.byteLength===0&&(x=new Uint8Array(s.memory.buffer)),x}function d(n,e){return A.decode(w().subarray(n,n+e))}const l=new Array(32).fill(void 0);l.push(void 0,null,!0,!1);let p=l.length;function c(n){p===l.length&&l.push(l.length+1);const e=p;return p=l[e],l[e]=n,e}function u(n){return l[n]}function L(n){n<36||(l[n]=p,p=n)}function O(n){const e=u(n);return L(n),e}let h=0;const m=new TextEncoder("utf-8"),U=typeof m.encodeInto=="function"?function(n,e){return m.encodeInto(n,e)}:function(n,e){const t=m.encode(n);return e.set(t),{read:n.length,written:t.length}};function M(n,e,t){if(t===void 0){const a=m.encode(n),f=e(a.length);return w().subarray(f,f+a.length).set(a),h=a.length,f}let r=n.length,i=e(r);const g=w();let o=0;for(;o<r;o++){const a=n.charCodeAt(o);if(a>127)break;g[i+o]=a}if(o!==r){o!==0&&(n=n.slice(o)),i=t(i,r,r=o+n.length*3);const a=w().subarray(i+o,i+r),f=U(n,a);o+=f.written}return h=o,i}let y=new Int32Array;function _(){return y.byteLength===0&&(y=new Int32Array(s.memory.buffer)),y}function N(n,e){return w().subarray(n/1,n/1+e)}function I(n){try{const o=s.__wbindgen_add_to_stack_pointer(-16),a=M(n,s.__wbindgen_malloc,s.__wbindgen_realloc),f=h;s.compile_wasm4(o,a,f);var e=_()[o/4+0],t=_()[o/4+1],r=_()[o/4+2],i=_()[o/4+3];if(i)throw O(r);var g=N(e,t).slice();return s.__wbindgen_free(e,t*1),g}finally{s.__wbindgen_add_to_stack_pointer(16)}}function E(n){return n==null}function b(n,e){try{return n.apply(this,e)}catch(t){s.__wbindgen_exn_store(c(t))}}async function z(n,e){if(typeof Response=="function"&&n instanceof Response){if(typeof WebAssembly.instantiateStreaming=="function")try{return await WebAssembly.instantiateStreaming(n,e)}catch(r){if(n.headers.get("Content-Type")!="application/wasm")console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n",r);else throw r}const t=await n.arrayBuffer();return await WebAssembly.instantiate(t,e)}else{const t=await WebAssembly.instantiate(n,e);return t instanceof WebAssembly.Instance?{instance:t,module:n}:t}}function P(){const n={};return n.wbg={},n.wbg.__wbindgen_string_new=function(e,t){const r=d(e,t);return c(r)},n.wbg.__wbindgen_object_drop_ref=function(e){O(e)},n.wbg.__wbg_instanceof_Window_acc97ff9f5d2c7b4=function(e){let t;try{t=u(e)instanceof Window}catch{t=!1}return t},n.wbg.__wbg_document_3ead31dbcad65886=function(e){const t=u(e).document;return E(t)?0:c(t)},n.wbg.__wbg_getElementById_3a708b83e4f034d7=function(e,t,r){const i=u(e).getElementById(d(t,r));return E(i)?0:c(i)},n.wbg.__wbg_settextContent_538ceb17614272d8=function(e,t,r){u(e).textContent=t===0?void 0:d(t,r)},n.wbg.__wbg_newnoargs_b5b063fc6c2f0376=function(e,t){const r=new Function(d(e,t));return c(r)},n.wbg.__wbg_call_97ae9d8645dc388b=function(){return b(function(e,t){const r=u(e).call(u(t));return c(r)},arguments)},n.wbg.__wbindgen_object_clone_ref=function(e){const t=u(e);return c(t)},n.wbg.__wbg_self_6d479506f72c6a71=function(){return b(function(){const e=self.self;return c(e)},arguments)},n.wbg.__wbg_window_f2557cc78490aceb=function(){return b(function(){const e=window.window;return c(e)},arguments)},n.wbg.__wbg_globalThis_7f206bda628d5286=function(){return b(function(){const e=globalThis.globalThis;return c(e)},arguments)},n.wbg.__wbg_global_ba75c50d1cf384f4=function(){return b(function(){const e=global.global;return c(e)},arguments)},n.wbg.__wbindgen_is_undefined=function(e){return u(e)===void 0},n.wbg.__wbg_new_abda76e883ba8a5f=function(){const e=new Error;return c(e)},n.wbg.__wbg_stack_658279fe44541cf6=function(e,t){const r=u(t).stack,i=M(r,s.__wbindgen_malloc,s.__wbindgen_realloc),g=h;_()[e/4+1]=g,_()[e/4+0]=i},n.wbg.__wbg_error_f851667af71bcfc6=function(e,t){try{console.error(d(e,t))}finally{s.__wbindgen_free(e,t)}},n.wbg.__wbindgen_throw=function(e,t){throw new Error(d(e,t))},n}function R(n,e){return s=n.exports,S.__wbindgen_wasm_module=e,y=new Int32Array,x=new Uint8Array,s.__wbindgen_start(),s}async function S(n){typeof n>"u"&&(n=new URL("/wasm4-playground/assets/rolandc_wasm_bg-602a8a49.wasm",self.location));const e=P();(typeof n=="string"||typeof Request=="function"&&n instanceof Request||typeof URL=="function"&&n instanceof URL)&&(n=fetch(n));const{instance:t,module:r}=await z(await n,e);return R(t,r)}var D=`//
// WASM-4: https://wasm4.org/docs

// ┌───────────────────────────────────────────────────────────────────────────┐
// │                                                                           │
// │ Platform Constants                                                        │
// │                                                                           │
// └───────────────────────────────────────────────────────────────────────────┘

export const SCREEN_SIZE: u32 = 160;
export const FONT_SIZE: u32 = 8;

// ┌───────────────────────────────────────────────────────────────────────────┐
// │                                                                           │
// │ Memory Addresses                                                          │
// │                                                                           │
// └───────────────────────────────────────────────────────────────────────────┘

export const PALETTE: usize = 0x04;
export const DRAW_COLORS: usize = 0x14;
export const GAMEPAD1: usize = 0x16;
export const GAMEPAD2: usize = 0x17;
export const GAMEPAD3: usize = 0x18;
export const GAMEPAD4: usize = 0x19;
export const MOUSE_X: usize = 0x1a;
export const MOUSE_Y: usize = 0x1c;
export const MOUSE_BUTTONS: usize = 0x1e;
export const SYSTEM_FLAGS: usize = 0x1f;
export const NETPLAY: usize = 0x20;
export const FRAMEBUFFER: usize = 0xa0;

export const BUTTON_1: u8 = 1;
export const BUTTON_2: u8 = 2;
export const BUTTON_LEFT: u8 = 16;
export const BUTTON_RIGHT: u8 = 32;
export const BUTTON_UP: u8 = 64;
export const BUTTON_DOWN: u8 = 128;

export const MOUSE_LEFT: u8 = 1;
export const MOUSE_RIGHT: u8 = 2;
export const MOUSE_MIDDLE: u8 = 4;

export const SYSTEM_PRESERVE_FRAMEBUFFER = 1;
export const SYSTEM_HIDE_GAMEPAD_OVERLAY = 2;

// ┌───────────────────────────────────────────────────────────────────────────┐
// │                                                                           │
// │ Drawing Functions                                                         │
// │                                                                           │
// └───────────────────────────────────────────────────────────────────────────┘

/** Copies pixels to the framebuffer. */
// @ts-ignore: decorator
@external("env", "blit")
export declare function blit (spritePtr: usize, x: i32, y: i32, width: u32, height: u32, flags: u32): void;

/** Copies a subregion within a larger sprite atlas to the framebuffer. */
// @ts-ignore: decorator
@external("env", "blitSub")
export declare function blitSub (spritePtr: usize, x: i32, y: i32, width: u32, height: u32,
    srcX: u32, srcY: u32, stride: i32, flags: u32): void;

export const BLIT_1BPP: u32 = 0;
export const BLIT_2BPP: u32 = 1;
export const BLIT_FLIP_X: u32 = 2;
export const BLIT_FLIP_Y: u32 = 4;
export const BLIT_ROTATE: u32 = 8;

/** Draws a line between two points. */
// @ts-ignore: decorator
@external("env", "line")
export declare function line (x1: i32, y1: i32, x2: i32, y2: i32): void;

/** Draws a horizontal line. */
// @ts-ignore: decorator
@external("env", "hline")
export declare function hline (x: i32, y: i32, len: u32): void;

/** Draws a vertical line. */
// @ts-ignore: decorator
@external("env", "vline")
export declare function vline (x: i32, y: i32, len: u32): void;

/** Draws an oval (or circle). */
// @ts-ignore: decorator
@external("env", "oval")
export declare function oval (x: i32, y: i32, width: u32, height: u32): void;

/** Draws a rectangle. */
// @ts-ignore: decorator
@external("env", "rect")
export declare function rect (x: i32, y: i32, width: u32, height: u32): void;

/** Draws text using the built-in system font. */
export function text (str: string, x: i32, y: i32): void {
    const byteLength = load<u32>(changetype<usize>(str) - 4);
    textUtf16(str, byteLength, x, y);
}

// @ts-ignore: decorator
@external("env", "textUtf16")
declare function textUtf16 (text: string, byteLength: u32, x: i32, y: i32): void;

// ┌───────────────────────────────────────────────────────────────────────────┐
// │                                                                           │
// │ Sound Functions                                                           │
// │                                                                           │
// └───────────────────────────────────────────────────────────────────────────┘

/** Plays a sound tone. */
// @ts-ignore: decorator
@external("env", "tone")
export declare function tone (frequency: u32, duration: u32, volume: u32, flags: u32): void;

export const TONE_PULSE1: u32 = 0;
export const TONE_PULSE2: u32 = 1;
export const TONE_TRIANGLE: u32 = 2;
export const TONE_NOISE: u32 = 3;
export const TONE_MODE1: u32 = 0;
export const TONE_MODE2: u32 = 4;
export const TONE_MODE3: u32 = 8;
export const TONE_MODE4: u32 = 12;
export const TONE_PAN_LEFT: u32 = 16;
export const TONE_PAN_RIGHT: u32 = 32;
export const TONE_NOTE_MODE: u32 = 64;

// ┌───────────────────────────────────────────────────────────────────────────┐
// │                                                                           │
// │ Storage Functions                                                         │
// │                                                                           │
// └───────────────────────────────────────────────────────────────────────────┘

/** Reads up to \`size\` bytes from persistent storage into the pointer \`destPtr\`. */
// @ts-ignore: decorator
@external("env", "diskr")
export declare function diskr (dest: usize, size: u32): u32;

/** Writes up to \`size\` bytes from the pointer \`srcPtr\` into persistent storage. */
// @ts-ignore: decorator
@external("env", "diskw")
export declare function diskw (src: usize, size: u32): u32;

// ┌───────────────────────────────────────────────────────────────────────────┐
// │                                                                           │
// │ Other Functions                                                           │
// │                                                                           │
// └───────────────────────────────────────────────────────────────────────────┘

/** Prints a message to the debug console. */
export function trace (str: string): void {
    const ptr = changetype<usize>(str);
    const byteLength = load<u32>(ptr - 4);
    traceUtf16(ptr, byteLength);
}

// @ts-ignore: decorator
@external("env", "traceUtf16")
declare function traceUtf16 (str: usize, byteLength: u32): void;

// Pass abort messages to trace()
function abortHandler (message: string | null, fileName: string | null, lineNumber: u32, columnNumber: u32) :void {
    const ptr = changetype<usize>(message);
    if (ptr != 0) {
        const byteLength = load<u32>(ptr - 4);
        traceUtf16(ptr, byteLength);
    }
}

// Avoid requiring an external seed. Call \`Math.seedRandom()\` to manually seed \`Math.random()\`.
function seedHandler (): f64 {
    return 0;
}
`;const F=async n=>import("./asc-edbad651.js").then(e=>e.compileString({"main.ts":n,"wasm4.ts":D},{runtime:"incremental",importMemory:!0,initialMemory:1,maximumMemory:1,noExportMemory:!0,zeroFilledMemory:!0,memoryBase:6560,use:["seed=wasm4/seedHandler","abort=wasm4/abortHandler","trace="],optimizeLevel:3,shrinkLevel:2,converge:!0,noAssert:!0,debug:!1})).then(e=>e.error?`${e.error.message}: ${e.stderr.toString()}`:{wasm:e.binary,wat:e.text});let T=!1;const B=async n=>{T||(await S(),T=!0);try{return{wasm:I(n),wat:null}}catch(e){return`Error compiling roland: '${e}''`}};self.onmessage=async n=>{const t=await(n.data.lang==v.AssemblyScript?F:B)(n.data.text);self.postMessage(t)};
