<script lang="ts">
	import { onMount, tick } from 'svelte';

	import type { Parameter, Shader } from '$lib/common/types';

	import type { Flavor } from '$lib/flavors';
	import type { Ingredient } from '$lib/ingredients';
	import type { Connection } from '$lib/connections';

	import { draw } from '$lib/common/draw';

	export let width: number;
	export let height: number;

	let canvas: HTMLCanvasElement;

	export let mainIngredientId: number;

	export let flavors: Map<number, Flavor>;
	export let ingredients: Map<number, Ingredient>;
	export let connections: Map<number, Connection>;
	export let shaders: Map<number, Shader>;

	// export let media: (HTMLImageElement | HTMLVideoElement | HTMLAudioElement | WebGLTexture)[];

	export let programs: Map<number, WebGLProgram>;
	export let parameters: Map<number, Parameter>;

	onMount(async () => {
		await tick();
		let gl = canvas.getContext('webgl');

		let frame: number;
		function loop() {
			frame = requestAnimationFrame(loop);

			if (gl) {
				const knownParameters: Map<number, Parameter> = new Map(parameters);
				draw(
					gl,
					mainIngredientId,
					knownParameters,
					connections,
					ingredients,
					flavors,
					shaders,
					programs
				);
			}
		}
		loop();

		return () => cancelAnimationFrame(frame);
	});
</script>

<canvas bind:this={canvas} {width} {height} />

<style>
	canvas {
		pointer-events: none;
	}
</style>
