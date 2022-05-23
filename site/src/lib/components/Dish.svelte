<script lang="ts">
	import type { Writable } from 'svelte/store';

	import { Direction } from '$lib/common/types';
	import type { FullIngredient } from '$lib/ingredients';

	import type { Flavor } from '$lib/flavors';

	import CursorCircle from '$lib/cursor-circle/CursorCircle.svelte';
	import Connections from '$lib/connections/Connections.svelte';
	import Dock from '$lib/docks/Dock.svelte';

	import IngredientNode from '$lib/components/Ingredient.svelte';
	import { getContext } from 'svelte';

	export let flavors: Flavor[];
	export let ingredients: FullIngredient[];

	function createDefaultNode(coords: { x: number; y: number }) {
		const defaultIngredient: FullIngredient = {
			id: null,
			name: 'default',
			flavors: [],
			coords
		};

		ingredients = [...ingredients, defaultIngredient];
	}
</script>

<svelte:window on:scroll|preventDefault={() => {}} />

<canvas height={window.innerHeight} width={window.innerWidth} />

{#each ingredients as ingredient}
	<IngredientNode
		ingredientId={ingredient.id}
		flavors={ingredient.flavors}
		coords={ingredient.coords}
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
