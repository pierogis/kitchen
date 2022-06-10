<script lang="ts">
	import { Direction } from '$lib/common/types';
	import type { FullIngredient } from '$lib/ingredients';
	import type { Flavor } from '$lib/flavors';
	import type { Connection } from '$lib/connections';

	import CursorCircle from '$lib/cursor-circle/CursorCircle.svelte';
	import IngredientComponent from '$lib/components/Ingredient.svelte';
	import Dock from '$lib/docks/Dock.svelte';
	import { FlavorType } from '@prisma/client';
	import type { Writable } from 'svelte/store';

	export let ingredientId: number;
	export let flavors: Flavor[];
	export let ingredients: Writable<FullIngredient[]>;
	export let connections: Connection[];

	function createDefaultNode(coords: { x: number; y: number }) {
		const defaultIngredient: FullIngredient = {
			id: null,
			name: 'default',
			flavors: [
				{
					id: null,
					ingredientId: null,
					type: FlavorType.Text,
					name: 'text',
					parameters: { text: '' },
					options: null,
					directions: [Direction.Out]
				}
			],
			subIngredients: [],
			connections: [],
			parentIngredientId: ingredientId,
			x: coords.x,
			y: coords.y
		};

		$ingredients = [...$ingredients, defaultIngredient];
	}

	let canvasWidth: number, canvasHeight: number;
</script>

<svelte:window
	bind:innerHeight={canvasHeight}
	bind:innerWidth={canvasWidth}
	on:scroll|preventDefault={() => {}}
/>

<canvas height={canvasHeight} width={canvasWidth} />

{#each $ingredients as ingredient}
	<IngredientComponent
		ingredientId={ingredient.id}
		name={ingredient.name}
		flavors={ingredient.flavors}
		coords={{ x: ingredient.x, y: ingredient.y }}
	/>
{/each}

<Dock direction={Direction.In} />
<Dock direction={Direction.Out} />

<CursorCircle
	on:longpress={(event) => {
		let coords = event.detail;
		createDefaultNode(coords);
	}}
/>

<style>
	canvas {
		pointer-events: none;
	}
</style>
