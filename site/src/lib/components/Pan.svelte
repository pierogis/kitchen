<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { get } from 'svelte/store';

	import type * as THREE from 'three';

	import type { ViewState } from '@view';
	import type { RecipeState } from '@recipe';
	import { dispatchIngredientCreationActions } from '@state/batch/ingredient';

	import { init, cook } from '$lib/common/cook';

	export let width: number;
	export let height: number;

	export let recipeState: RecipeState;
	export let viewState: ViewState;

	let canvas: HTMLCanvasElement;

	function doubleClickAction(element: HTMLElement) {
		function handleDoubleClick(event: MouseEvent) {
			// right click
			event.preventDefault();

			const elements = document.elementsFromPoint(event.clientX, event.clientY);
			// the top most element clicked on should be an svg
			if (elements[0].tagName == 'svg') {
				dispatchIngredientCreationActions(
					recipeState,
					{ x: event.clientX, y: event.clientY },
					get(viewState.focusedIngredient).uuid
				);
			}

			return false;
		}

		element.addEventListener('dblclick', handleDoubleClick);

		return {
			destroy: () => {
				element.removeEventListener('dblclick', handleDoubleClick);
			}
		};
	}

	const materials: Map<string, THREE.ShaderMaterial> = new Map();

	let renderer: THREE.WebGLRenderer;
	let scene: THREE.Scene;
	let camera: THREE.Camera;

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

<svelte:window use:doubleClickAction />
<canvas bind:this={canvas} {width} {height} class="no-select" />

<style>
	canvas {
		display: block;

		position: fixed;
		top: 0;
		left: 0;
		z-index: -1;
	}
</style>
