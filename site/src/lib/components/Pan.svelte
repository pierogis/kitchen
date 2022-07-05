<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { get, writable, type Readable } from 'svelte/store';

	import type { Camera, Scene, ShaderMaterial, WebGLRenderer } from 'three';

	import type { Coordinates } from '@types';
	import type { ViewState } from '@view';
	import type { RecipeState } from '@recipe';
	import { dispatchIngredientCreationActions } from '@state/batch/ingredient';

	import { init, cook } from '$lib/common/cook';

	import CursorCircle from '@components/CursorCircle.svelte';

	export let width: number;
	export let height: number;

	export let recipeState: RecipeState;
	export let viewState: ViewState;

	export let cursorCoordinates: Readable<Coordinates | undefined>;

	let canvas: HTMLCanvasElement;

	// export let media: (HTMLImageElement | HTMLVideoElement | HTMLAudioElement | WebGLTexture)[];

	const pressing = writable(false);

	function rightClickAction(element: Window) {
		function handleDoubleClick(event: MouseEvent) {
			// right click
			event.preventDefault();
			dispatchIngredientCreationActions(
				recipeState,
				{ x: event.clientX, y: event.clientY },
				get(viewState.focusedIngredient).uuid
			);
			return false;
		}

		element.addEventListener('dblclick', handleDoubleClick);

		return {
			destroy: () => {
				element.removeEventListener('dblclick', handleDoubleClick);
			}
		};
	}

	const materials: Map<string, ShaderMaterial> = new Map();

	let renderer: WebGLRenderer;
	let scene: Scene;
	let camera: Camera;

	$: {
		if (canvas) {
			canvas.width = width;
			canvas.height = height;
			canvas.style.width = width + 'px';
			canvas.style.height = height + 'px';
		}
	}

	onMount(async () => {
		await tick();

		({ renderer, scene, camera } = init(canvas));

		recipeState.subscribe((recipe) => {
			cook(renderer, scene, camera, materials, recipe, viewState);
		});
	});
</script>

<svelte:window use:rightClickAction />
<canvas bind:this={canvas} {width} {height} />

{#if $cursorCoordinates}
	<CursorCircle cursorCoordinates={$cursorCoordinates} pressing={$pressing} />
{/if}

<style>
	canvas {
		display: block;

		position: fixed;
		top: 0;
		left: 0;
		z-index: -1;
	}
</style>
