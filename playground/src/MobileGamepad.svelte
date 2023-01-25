<script lang="ts">
	import * as constants from "../../wasm4/runtimes/web/src/constants";

	export let gamepad: number[];

	$: console.log(gamepad);

	$: if ((gamepad[0] & constants.BUTTON_Z) != 0) {
		console.log("z");
	}
</script>

<div
	class="w-full h-48 bg-gray-500 grid grid-cols-2 select-none rounded-br-md rounded-bl-md"
>
	<div class="flex justify-center items-center">
		<div class="h-32 w-32 grid grid-cols-3 grid-rows-3">
			<div />
			<div class="bg-gray-600 rounded-tr-xl rounded-tl-xl" />
			<div />
			<div class="bg-gray-600 rounded-tl-xl rounded-bl-xl" />
			<div class="bg-gray-600">
				<div class="w-full h-full bg-gray-500 rounded-full" />
			</div>
			<div class="bg-gray-600 rounded-tr-xl rounded-br-xl" />
			<div />
			<div class="bg-gray-600 rounded-br-xl rounded-bl-xl" />
			<div />
		</div>
	</div>
	<div class="relative flex items-center justify-center">
		<div class="gamepad-button translate-y-8 -translate-x-6">
			<span class="font-bold text-2xl">X</span>
		</div>
		<div class="gamepad-button -translate-y-8 translate-x-8">
			<span class="font-bold text-2xl">Z</span>
		</div>
	</div>
</div>
