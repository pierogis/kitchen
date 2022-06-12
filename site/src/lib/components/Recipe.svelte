<script lang="ts">
	import { derived } from 'svelte/store';
	import { Direction } from '$lib/common/types';
	import type { CallFor, Ingredient } from '$lib/ingredients';
	import { type Flavor, FlavorType } from '$lib/flavors';
	import type { Connection } from '$lib/connections';

	// store access
	import { recipeUuid } from '$lib/stores';
	import { addCallFor } from '$lib/stores/callsFor';
	import { addIngredient } from '$lib/stores/ingredients';
	import { addLocation } from '$lib/stores/locations';
	import { addFlavor, flavors } from '$lib/stores/flavors';

	import CursorCircle from '$lib/cursor-circle/CursorCircle.svelte';
	import IngredientComponent from '$lib/components/Ingredient.svelte';
	import Dock from '$lib/docks/Dock.svelte';

	export let ingredientUuid: string;
	export let focusedFlavors: Flavor[];
	export let callsFor: Map<string, CallFor>;
	export let ingredients: Map<string, Ingredient>;
	export let connections: Connection[];

	function createIngredient(coords: { x: number; y: number }) {
		const newIngredient = addIngredient({
			name: 'default',
			parentIngredientUuid: ingredientUuid
		});

		const newCallFor = addCallFor({
			recipeUuid: $recipeUuid,
			ingredientUuid: newIngredient.uuid
		});

		addFlavor({
			ingredientUuid: newIngredient.uuid,
			type: FlavorType.Text,
			name: 'text',
			options: null,
			directions: [Direction.Out]
		});

		addLocation({ ...coords, callForUuid: newCallFor.uuid });
	}

	let canvasWidth: number, canvasHeight: number;
</script>

<svelte:window
	bind:innerHeight={canvasHeight}
	bind:innerWidth={canvasWidth}
	on:scroll|preventDefault={() => {}}
/>

<canvas height={canvasHeight} width={canvasWidth} />

{#each Array.from(callsFor.values()) as callFor}
	<IngredientComponent
		ingredientUuid={callFor.ingredientUuid}
		name={ingredients.get(callFor.ingredientUuid)?.name}
		flavors={ingredientFlavors.get()}
		coords={coord.get(callFor.ingredientUuid).name}
	/>
{/each}

<Dock direction={Direction.In} />
<Dock direction={Direction.Out} />

<CursorCircle
	on:longpress={(event) => {
		let coords = event.detail;
		createIngredient(coords);
	}}
/>

<style>
	canvas {
		pointer-events: none;
	}
</style>
