<script lang="ts">
  import { onMount } from "svelte";

  export let wasm: Uint8Array;
  export let focused: boolean;

  import * as constants from "../../wasm4/runtimes/web/src/constants";
  import { Runtime } from "../../wasm4/runtimes/web/src/runtime";

  let runtime: Runtime = new Runtime("wasm4-demo");
  let mounted: boolean = false;

  let gamepad = [0, 0, 0, 0];
  let mouseX = 0;
  let mouseY = 0;
  let mouseButtons = 0;

  $: if (wasm && wasm.length > 0) resetGame(wasm);

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

    if (wasm && wasm.length > 0) {
      await runtime.load(wasm);
    }
    runtime.start();
    requestAnimationFrame(onFrame);

    mounted = true;
  });

  // cryptic function from stack overflow
  const isMobile: () => boolean = () => {
    let check = false;
    (function (a) {
      if (
        /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
          a
        ) ||
        /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
          a.substr(0, 4)
        )
      )
        check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
  };

  let mobile: boolean = isMobile();
</script>

<div class="w-full border-2 border-gray-400 rounded-md">
  <div class="w-full" id="gameroot" />
  {#if mobile}
    <div
      class="w-full h-40 bg-gray-400 rounded-br-md rounded-bl-md grid grid-cols-2"
    >
      <div class="flex items-center justify-center">
        <div class="grid grid-cols-3 grid-rows-3 gap-0 h-28 w-28">
          <div />
          <button
            on:click={(event) => {
              if (event.type == "keydown") {
                gamepad[0] |= constants.BUTTON_UP;
              } else {
                gamepad[0] &= ~constants.BUTTON_UP;
              }
            }}
            class="bg-gray-700 rounded-tr-xl rounded-tl-xl"
          />
          <div />
          <button
            on:click={(event) => {
              if (event.type == "keydown") {
                gamepad[0] |= constants.BUTTON_LEFT;
              } else {
                gamepad[0] &= ~constants.BUTTON_LEFT;
              }
            }}
            class="bg-gray-700 rounded-tl-xl rounded-bl-xl"
          />
          <div class="bg-gray-700">
            <div class="rounded-full bg-gray-600 w-full h-full" />
          </div>
          <button
            on:click={(event) => {
              if (event.type == "keydown") {
                gamepad[0] |= constants.BUTTON_RIGHT;
              } else {
                gamepad[0] &= ~constants.BUTTON_RIGHT;
              }

              console.log("right!");
            }}
            class="bg-gray-700 rounded-tr-xl rounded-br-xl"
          />
          <div />
          <button
            on:click={(event) => {
              if (event.type == "keydown") {
                gamepad[0] |= constants.BUTTON_DOWN;
              } else {
                gamepad[0] &= ~constants.BUTTON_DOWN;
              }
            }}
            class="bg-gray-700 rounded-br-xl rounded-bl-xl"
          />
          <div />
        </div>
      </div>
      <div class="bg-gray-400 flex justify-center items-center">
        <p>mobile gamepad is a work in progress</p>
      </div>
    </div>
  {/if}
</div>
