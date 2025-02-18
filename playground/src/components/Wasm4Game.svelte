<script lang="ts">
  import { onMount } from "svelte";
  import mobile from "is-mobile";

  import * as constants from "../../../wasm4/runtimes/web/src/constants";
  import {
    BUTTON_UP,
    BUTTON_LEFT,
    BUTTON_RIGHT,
    BUTTON_DOWN,
    BUTTON_X,
    BUTTON_Z,
  } from "../../../wasm4/runtimes/web/src/constants";
  import { Runtime } from "../../../wasm4/runtimes/web/src/runtime";

  export let wasm: Uint8Array;
  let gamepadVisible: boolean = mobile();

  let runtime: Runtime = new Runtime("wasm4-demo");
  let mounted: boolean = false;
  let focused: boolean = false;

  let gamepad = [0, 0, 0, 0];
  let mouseX = 0;
  let mouseY = 0;
  let mouseButtons = 0;

  $: if (wasm && wasm.length > 0) resetGame(wasm);
  $: if (!focused) mouseButtons = 0;

  const resetGame = async (b: Uint8Array) => {
    if (!runtime.wasm || !mounted) {
      return;
    }

    runtime.reset(true);

    runtime.pauseState |= constants.PAUSE_REBOOTING;
    await runtime.load(b);
    runtime.pauseState &= ~constants.PAUSE_REBOOTING;

    runtime.start();
  };

  // start audio on mouse move
  window.addEventListener("pointerup", () => runtime.unlockAudio());

  // update mouse input values on mouse move
  const onMouseEvent = (event: PointerEvent) => {
    if (!focused) {
      return;
    }

    document.body.style.cursor = "";

    if (event.isPrimary) {
      const bounds = runtime.canvas.getBoundingClientRect();
      mouseX = Math.fround(
        (constants.WIDTH * (event.clientX - bounds.left)) / bounds.width,
      );
      mouseY = Math.fround(
        (constants.HEIGHT * (event.clientY - bounds.top)) / bounds.height,
      );
      mouseButtons = event.buttons & 0b111;
    }
  };
  window.addEventListener("pointerdown", onMouseEvent);
  window.addEventListener("pointerup", onMouseEvent);
  window.addEventListener("pointermove", onMouseEvent);

  const onKeyboardEvent = (event: KeyboardEvent) => {
    if (event.ctrlKey || event.altKey || !focused) {
      return; // Ignore ctrl/alt modified key presses because they may be the user trying to navigate
    }

    const down = event.type == "keydown";

    // Poke WebAudio
    runtime.unlockAudio();

    // We're using the keyboard now, hide the mouse cursor for extra immersion
    if (focused) {
      document.body.style.cursor = "none";
    }

    let playerIdx = 0;
    let mask = 0;
    switch (event.code) {
      // Player 1
      case "KeyX":
      case "KeyV":
      case "Space":
      case "Period":
        mask = constants.BUTTON_X;
        break;
      case "KeyZ":
      case "KeyC":
      case "Comma":
        mask = constants.BUTTON_Z;
        break;
      case "ArrowUp":
        mask = constants.BUTTON_UP;
        break;
      case "ArrowDown":
        mask = constants.BUTTON_DOWN;
        break;
      case "ArrowLeft":
        mask = constants.BUTTON_LEFT;
        break;
      case "ArrowRight":
        mask = constants.BUTTON_RIGHT;
        break;

      // Player 2
      case "KeyA":
      case "KeyQ":
        playerIdx = 1;
        mask = constants.BUTTON_X;
        break;
      case "ShiftLeft":
      case "Tab":
        playerIdx = 1;
        mask = constants.BUTTON_Z;
        break;
      case "KeyE":
        playerIdx = 1;
        mask = constants.BUTTON_UP;
        break;
      case "KeyD":
        playerIdx = 1;
        mask = constants.BUTTON_DOWN;
        break;
      case "KeyS":
        playerIdx = 1;
        mask = constants.BUTTON_LEFT;
        break;
      case "KeyF":
        playerIdx = 1;
        mask = constants.BUTTON_RIGHT;
        break;

      // Player 3
      case "NumpadMultiply":
      case "NumpadDecimal":
        playerIdx = 2;
        mask = constants.BUTTON_X;
        break;
      case "NumpadSubtract":
      case "NumpadEnter":
        playerIdx = 2;
        mask = constants.BUTTON_Z;
        break;
      case "Numpad8":
        playerIdx = 2;
        mask = constants.BUTTON_UP;
        break;
      case "Numpad5":
        playerIdx = 2;
        mask = constants.BUTTON_DOWN;
        break;
      case "Numpad4":
        playerIdx = 2;
        mask = constants.BUTTON_LEFT;
        break;
      case "Numpad6":
        playerIdx = 2;
        mask = constants.BUTTON_RIGHT;
        break;
    }

    if (mask != 0) {
      event.preventDefault();

      // Set or clear the button bit from the next input state
      if (down) {
        gamepad[playerIdx] |= mask;
      } else {
        gamepad[playerIdx] &= ~mask;
      }
    }
  };
  window.addEventListener("keydown", onKeyboardEvent);
  window.addEventListener("keyup", onKeyboardEvent);

  // When we should perform the next update
  let timeNextUpdate = performance.now();

  const onFrame = (timeFrameStart: number) => {
    requestAnimationFrame(onFrame);

    let calledUpdate = false;

    // Prevent timeFrameStart from getting too far ahead and death spiralling
    if (timeFrameStart - timeNextUpdate >= 200) {
      timeNextUpdate = timeFrameStart;
    }

    while (timeFrameStart >= timeNextUpdate) {
      timeNextUpdate += 1000 / 60;

      // Pass inputs into runtime memory
      for (let playerIdx = 0; playerIdx < 4; ++playerIdx) {
        runtime.setGamepad(playerIdx, gamepad[playerIdx]);
      }
      runtime.setMouse(mouseX, mouseY, mouseButtons);
      runtime.update();
      calledUpdate = true;
    }

    if (calledUpdate) {
      runtime.composite();
    }
  };

  onMount(async () => {
    await runtime.init();
    runtime.canvas.classList.add("gamecanvas");
    document.getElementById("gameroot").appendChild(runtime.canvas);

    if (wasm && wasm.length > 0) {
      await runtime.load(wasm);
    }
    runtime.start();
    requestAnimationFrame(onFrame);

    mounted = true;
  });

  const isButtonDown = (g: number, b: number) => (g & b) != 0;
  const buttonDown = (n: number) => (gamepad[0] |= n);
  const buttonUp = (n: number) => (gamepad[0] &= ~n);
  const mouseEnter = (event: any, n: number) => {
    if (event.buttons == 1) {
      buttonDown(n);
    }
  };
</script>

<div
  on:focus={() => (focused = true)}
  on:blur={() => (focused = false)}
  tabindex="-1"
  class="w-full rounded-md relative"
>
  <button
    class="italic text-xs underline absolute top-0 right-1"
    on:click={() => (gamepadVisible = !gamepadVisible)}>{gamepadVisible ? "hide" : "show"} gamepad</button
  >
  <div class="w-full" id="gameroot" />
  {#if gamepadVisible}
    <div
      class="w-full flow-root h-48 p-4 select-none rounded-br-md rounded-bl-md bg-base-200"
    >
      <div class="float-left h-full flex justify-center items-center">
        <div class="w-32 h-32 grid grid-cols-3 grid-rows-3">
          <div
            on:mousedown={() => buttonDown(BUTTON_UP | BUTTON_LEFT)}
            on:mouseup={() => buttonUp(BUTTON_UP | BUTTON_LEFT)}
            on:mouseenter={(event) =>
              mouseEnter(event, BUTTON_UP | BUTTON_LEFT)}
            on:mouseleave={() => buttonUp(BUTTON_UP | BUTTON_LEFT)}
            on:touchstart={() => buttonDown(BUTTON_UP | BUTTON_LEFT)}
            on:touchend={() => buttonUp(BUTTON_UP | BUTTON_LEFT)}
          />
          <div
            on:mousedown={() => buttonDown(BUTTON_UP)}
            on:mouseup={() => buttonUp(BUTTON_UP)}
            on:mouseenter={(event) => mouseEnter(event, BUTTON_UP)}
            on:mouseleave={() => buttonUp(BUTTON_UP)}
            on:touchstart={() => buttonDown(BUTTON_UP)}
            on:touchend={() => buttonUp(BUTTON_UP)}
            class="bg-neutral rounded-tr-xl rounded-tl-xl"
            class:border-t-8={isButtonDown(gamepad[0], BUTTON_UP)}
            class:border-gray={isButtonDown(gamepad[0], BUTTON_UP)}
          />
          <div
            on:mousedown={() => buttonDown(BUTTON_UP | BUTTON_RIGHT)}
            on:mouseup={() => buttonUp(BUTTON_UP | BUTTON_RIGHT)}
            on:mouseenter={(event) =>
              mouseEnter(event, BUTTON_UP | BUTTON_RIGHT)}
            on:mouseleave={() => buttonUp(BUTTON_UP | BUTTON_RIGHT)}
            on:touchstart={() => buttonDown(BUTTON_UP | BUTTON_RIGHT)}
            on:touchend={() => buttonUp(BUTTON_UP | BUTTON_RIGHT)}
          />
          <div
            on:mousedown={() => buttonDown(BUTTON_LEFT)}
            on:mouseup={() => buttonUp(BUTTON_LEFT)}
            on:mouseenter={(event) => mouseEnter(event, BUTTON_LEFT)}
            on:mouseleave={() => buttonUp(BUTTON_LEFT)}
            on:touchstart={() => buttonDown(BUTTON_LEFT)}
            on:touchend={() => buttonUp(BUTTON_LEFT)}
            class="bg-neutral rounded-tl-xl rounded-bl-xl"
            class:border-l-8={isButtonDown(gamepad[0], BUTTON_LEFT)}
            class:border-gray={isButtonDown(gamepad[0], BUTTON_LEFT)}
          />
          <div class="">
            <div class="w-full h-full bg-neutral rounded-full" />
          </div>
          <div
            on:mousedown={() => buttonDown(BUTTON_RIGHT)}
            on:mouseup={() => buttonUp(BUTTON_RIGHT)}
            on:mouseenter={(event) => mouseEnter(event, BUTTON_RIGHT)}
            on:mouseleave={() => buttonUp(BUTTON_RIGHT)}
            on:touchstart={() => buttonDown(BUTTON_RIGHT)}
            on:touchend={() => buttonUp(BUTTON_RIGHT)}
            class="bg-neutral rounded-tr-xl rounded-br-xl"
            class:border-r-8={isButtonDown(gamepad[0], BUTTON_RIGHT)}
            class:border-gray={isButtonDown(gamepad[0], BUTTON_RIGHT)}
          />
          <div
            on:mousedown={() => buttonDown(BUTTON_DOWN | BUTTON_LEFT)}
            on:mouseup={() => buttonUp(BUTTON_DOWN | BUTTON_LEFT)}
            on:mouseenter={(event) =>
              mouseEnter(event, BUTTON_DOWN | BUTTON_LEFT)}
            on:mouseleave={() => buttonUp(BUTTON_DOWN | BUTTON_LEFT)}
            on:touchstart={() => buttonDown(BUTTON_DOWN | BUTTON_LEFT)}
            on:touchend={() => buttonUp(BUTTON_DOWN | BUTTON_LEFT)}
          />
          <div
            on:mousedown={() => buttonDown(BUTTON_DOWN)}
            on:mouseup={() => buttonUp(BUTTON_DOWN)}
            on:mouseenter={(event) => mouseEnter(event, BUTTON_DOWN)}
            on:mouseleave={() => buttonUp(BUTTON_DOWN)}
            on:touchstart={() => buttonDown(BUTTON_DOWN)}
            on:touchend={() => buttonUp(BUTTON_DOWN)}
            class="bg-neutral rounded-br-xl rounded-bl-xl"
            class:border-b-8={isButtonDown(gamepad[0], BUTTON_DOWN)}
            class:border-gray={isButtonDown(gamepad[0], BUTTON_DOWN)}
          />
          <div
            on:mousedown={() => buttonDown(BUTTON_DOWN | BUTTON_RIGHT)}
            on:mouseup={() => buttonUp(BUTTON_DOWN | BUTTON_RIGHT)}
            on:mouseenter={(event) =>
              mouseEnter(event, BUTTON_DOWN | BUTTON_RIGHT)}
            on:mouseleave={() => buttonUp(BUTTON_DOWN | BUTTON_RIGHT)}
            on:touchstart={() => buttonDown(BUTTON_DOWN | BUTTON_RIGHT)}
            on:touchend={() => buttonUp(BUTTON_DOWN | BUTTON_RIGHT)}
          />
        </div>
      </div>
      <div class="float-right h-full flex items-center pt-10 md:pr-3">
        <div
          class="h-2/5 w-full space-x-4 flex text-xs text-bg-dark font-bold text-center"
        >
          <div class="bg-base-300 rounded-md w-16 h-16 p-1 relative">
            <span class="absolute bottom-0 right-1">X</span>
            <div
              on:touchstart={() => buttonDown(BUTTON_X)}
              on:touchend={() => buttonUp(BUTTON_X)}
              on:mousedown={() => buttonDown(BUTTON_X)}
              on:mouseup={() => buttonUp(BUTTON_X)}
              class="w-full h-full rounded-full bg-secondary"
              class:btn-gamepad-active={isButtonDown(gamepad[0], BUTTON_X)}
            />
          </div>
          <div class="bg-base-300 rounded-md w-16 h-16 p-1 relative">
            <span class="absolute bottom-0 right-1">Z</span>
            <div
              on:touchstart={() => buttonDown(BUTTON_Z)}
              on:touchend={() => buttonUp(BUTTON_Z)}
              on:mousedown={() => buttonDown(BUTTON_Z)}
              on:mouseup={() => buttonUp(BUTTON_Z)}
              class="w-full h-full rounded-full bg-secondary"
              class:btn-gamepad-active={isButtonDown(gamepad[0], BUTTON_Z)}
            />
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
