<script lang="ts">
	import "../../wasm4/cli/assets/runtime/slim/wasm4.js";
  import { encode } from "../../wasm4-runtime/src/z85";
	import { onMount } from "svelte";

	export let wasmBinary: Uint8Array;

	onMount(() => {
		let json = document.createElement("script");
		json.id = "wasm4-cart-json";
		json.textContent = JSON.stringify({
			WASM4_CART: encode(wasmBinary),
			WASM4_CART_LENGTH: wasmBinary.length,
		}).replace(/<\//g, '<\\u002F').replace(/<!/g, '<\\u0021');
	
		document.getElementById("wasm4-game").appendChild(json);
	});
</script>

<main id="wasm4-game">
	<script id="wasm4-disk-prefix" type="text/plain">Wasm4 Demo Game</script>
	<wasm4-app></wasm4-app>
</main>
