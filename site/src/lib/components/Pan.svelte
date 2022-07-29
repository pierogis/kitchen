<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { get } from 'svelte/store';

	import type * as THREE from 'three';

	import type { ViewState } from '@view';
	import type { RecipeState } from '@recipe';

	import { init, cook } from '$lib/common/cook';

	export let width: number;
	export let height: number;

	export let recipeState: RecipeState;
	export let viewState: ViewState;

	let canvas: HTMLCanvasElement;

	let renderer: THREE.WebGLRenderer;
	let scene: THREE.Scene;
	let context: CanvasRenderingContext2D;

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

		({ renderer, scene, context } = init(viewState, canvas));

		recipeState.subscribe(($recipe) => {
			cook(renderer, scene, get(viewState.mainCamera), context, $recipe, viewState);
		});
		viewState.mainCamera.subscribe(($camera) => {
			cook(renderer, scene, $camera, context, get(recipeState), viewState);
		});
	});
</script>

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
