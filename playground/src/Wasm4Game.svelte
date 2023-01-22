<script lang="ts">
  import { onMount } from "svelte";

  export let wasm: Uint8Array;
  export let focused: boolean;

  import * as constants from "../../wasm4/runtimes/web/src/constants";
  import { Runtime } from "../../wasm4/runtimes/web/src/runtime";

  let runtime: Runtime = new Runtime("wasm4-demo");

  let gamepad = [0, 0, 0, 0];
  let mouseX = 0;
  let mouseY = 0;
  let mouseButtons = 0;

  $: updateGame(wasm);

  const updateGame = async (b: Uint8Array) => {
    if (!runtime.wasm) {
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
    document.body.style.cursor = "";

    if (event.isPrimary) {
      const bounds = runtime.canvas.getBoundingClientRect();
      mouseX = Math.fround(
        (constants.WIDTH * (event.clientX - bounds.left)) / bounds.width
      );
      mouseY = Math.fround(
        (constants.HEIGHT * (event.clientY - bounds.top)) / bounds.height
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

    await runtime.load(wasm);
    runtime.start();
    requestAnimationFrame(onFrame);
  });
</script>

<div class="w-full h-full" id="gameroot" />
