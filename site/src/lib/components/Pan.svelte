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

	export let mainCallForUuid: string;

	export let flavors: Map<string, Flavor>;
	export let ingredients: Map<string, Ingredient>;
	export let connections: Map<string, Connection>;
	export let shaders: Map<string, Shader>;

	// export let media: (HTMLImageElement | HTMLVideoElement | HTMLAudioElement | WebGLTexture)[];

	const programs: Map<string, WebGLProgram> = new Map();
	export let parameters: Map<string, Parameter>;

	onMount(async () => {
		await tick();
		let gl = canvas.getContext('webgl');

		let frame: number;
		function loop() {
			frame = requestAnimationFrame(loop);

			if (gl) {
				const knownParameters: Map<string, Parameter> = new Map(parameters);
				draw(
					gl,
					mainCallForUuid,
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
