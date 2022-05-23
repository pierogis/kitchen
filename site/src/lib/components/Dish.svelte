<script lang="ts">
	import { Direction } from '$lib/common/types';
	import type { FullIngredient } from '$lib/ingredients';
	import type { Flavor } from '$lib/flavors';
	import type { Connection } from '$lib/connections';

	import CursorCircle from '$lib/cursor-circle/CursorCircle.svelte';
	import Connections from '$lib/connections/Connections.svelte';
	import IngredientNode from '$lib/components/Ingredient.svelte';
	import Dock from '$lib/docks/Dock.svelte';

	export let ingredientId: number;
	export let flavors: Flavor[];
	export let ingredients: FullIngredient[];
	export let connections: Connection[];

	function createDefaultNode(coords: { x: number; y: number }) {
		const defaultIngredient: FullIngredient = {
			id: null,
			name: 'default',
			flavors: [],
			subIngredients: [],
			connections: [],
			parentIngredientId: ingredientId,
			x: coords.x,
			y: coords.y
		};

		ingredients = [...ingredients, defaultIngredient];
	}

	let canvasWidth: number, canvasHeight: number;
</script>

<svelte:window
	bind:innerHeight={canvasHeight}
	bind:innerWidth={canvasWidth}
	on:scroll|preventDefault={() => {}}
/>

<canvas height={canvasHeight} width={canvasWidth} />

{#each ingredients as ingredient}
	<IngredientNode
		ingredientId={ingredient.id}
		flavors={ingredient.flavors}
		coords={{ x: ingredient.x, y: ingredient.y }}
	/>
{/each}

<Dock direction={Direction.In} />
<Dock direction={Direction.Out} />

<Connections />

<CursorCircle
	on:longpress={(event) => {
		let coords = event.detail;
		createDefaultNode(coords);
	}}
/>

<style>
	:global(:root) {
		--primary-color: hsla(160, 20%, 75%, 0.8);
		--shadow-color: hsla(0, 0%, 0%, 0.2);
		--label-color: hsla(230, 5%, 30%, 0.7);

		--button-color: hsla(0, 0%, 70%, 1);
		--button-color-hover: hsla(0, 0%, 85%, 1);

		--tp-base-background-color: var(--primary-color);
		--tp-base-shadow-color: var(--shadow-color);
		--tp-button-background-color: var(--button-color);
		--tp-button-background-color-hover: var(--button-color-hover);
		--tp-label-foreground-color: var(--label-color);

		--remove-color: hsla(0, 80%, 70%, 0.8);
		--cable-color-number: rgba(120, 150, 190, 1);
	}
	:global(body) {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu',
			'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		background-color: #282c34;
		margin: 0px;
	}
	canvas {
		pointer-events: none;
	}
</style>
