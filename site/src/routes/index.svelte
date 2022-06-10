<script lang="ts" context="module">
	import type { FullRecipe } from '$lib/common/types';
	import { defaultRecipe } from './_recipe';

	/** @type {import('./index').Load} */
	export async function load() {
		return {
			props: {
				recipe: defaultRecipe
			}
		};
	}
</script>

<script lang="ts">
	import { viewportStore } from '$lib/viewport/viewport';
	import Pan from '$lib/components/Pan.svelte';
	import type { Ingredient } from '$lib/ingredients';
	import {
		flattenRecipe,
		ingredients,
		flavors,
		connections,
		parameters,
		shaders
	} from '$lib/stores';

	let innerWidth = 0,
		innerHeight = 0;

	viewportStore.set({ width: innerWidth, height: innerHeight });

	export let recipe: FullRecipe;

	flattenRecipe(recipe);

	const connections = recipe.mainIngredient.connections.reduce((previous, current) => {
		previous.set(current.id, current);
		return previous;
	}, new Map());
	const programs = new Map();
	const shaders = new Map();
	const parameters = recipe.mainIngredient.flavors.reduce((previous, current) => {
		previous.set(current.id, current);
		return previous;
	}, new Map());
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<!-- <Recipe
	ingredientId={recipe.mainIngredientId}
	flavors={recipe.mainIngredient.flavors}
	ingredients={writable(recipe.mainIngredient.subIngredients)}
	connections={recipe.mainIngredient.connections}
/> -->

<Pan
	width={innerWidth}
	height={innerHeight}
	mainIngredientId={recipe.mainIngredientId}
	ingredients={$ingredients}
	flavors={$flavors}
	connections={$connections}
	programs={$programs}
	shaders={$shaders}
	parameters={$parameters}
/>
