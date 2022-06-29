<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { writable, type Readable } from 'svelte/store';

	import { cookPayloads } from '$lib/common/cook';

	import type { Coordinates } from '@types';
	import type { ViewState } from '@view';
	import type { RecipeState } from '@recipe';
	import { dispatchIngredientCreationActions } from '@state/batch/ingredient';

	import CursorCircle from '@components/CursorCircle.svelte';
	import type { Pass } from 'three/examples/jsm/postprocessing/Pass';
	import { OrthographicCamera, WebGLRenderer } from 'three';

	export let width: number;
	export let height: number;

	export let recipeState: RecipeState;
	export let viewState: ViewState;

	export let cursorCoordinates: Readable<Coordinates | undefined>;

	let canvas: HTMLCanvasElement;

	// export let media: (HTMLImageElement | HTMLVideoElement | HTMLAudioElement | WebGLTexture)[];

	const pressing = writable(false);

	function longPressAction(canvas: HTMLCanvasElement) {
		const touchDuration = 500;

		// this timer will fire a callback if you press long enough
		let longPressTimer: NodeJS.Timeout | null;

		function handleMouseUp() {
			// nullify longpress timer from click
			$pressing = false;
			if (longPressTimer) {
				clearTimeout(longPressTimer);
				longPressTimer = null;
			}
		}

		function handleMouseDown(event: MouseEvent) {
			// click
			if (!longPressTimer && event.button == 0) {
				window.addEventListener('mouseup', handleMouseUp);
				$pressing = true;
				// send an event at end of timer
				longPressTimer = setTimeout(() => {
					longPressTimer = null;
					window.removeEventListener('mouseup', handleMouseUp);
					$pressing = false;
					// notify parent that there has been a long press
					dispatchIngredientCreationActions(recipeState, { x: event.clientX, y: event.clientY });
				}, touchDuration);
			}
		}

		canvas.addEventListener('mousedown', handleMouseDown);

		return {
			destroy: () => {
				window.removeEventListener('mouseup', handleMouseUp);
				canvas.removeEventListener('mousedown', handleMouseDown);
			}
		};
	}

	const passes: Map<string, Pass> = new Map();

	onMount(async () => {
		await tick();
		let gl = canvas.getContext('webgl');
		let renderer: WebGLRenderer;

		let frame: number;
		function loop() {
			frame = requestAnimationFrame(loop);

			if (gl && !renderer) {
				renderer = new WebGLRenderer(gl);
				cookPayloads(renderer, passes, $recipeState, viewState);
			}
		}
		loop();

		return () => cancelAnimationFrame(frame);
	});
</script>

<canvas bind:this={canvas} use:longPressAction {width} {height} />

{#if $cursorCoordinates}
	<CursorCircle cursorCoordinates={$cursorCoordinates} pressing={$pressing} />
{/if}

<style>
	canvas {
		display: block;
	}
</style>
