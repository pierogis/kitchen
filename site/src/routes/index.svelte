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
	import { writable } from 'svelte/store';

	import Dish from '$lib/components/Dish.svelte';
	import { viewportStore } from '$lib/viewport/viewport';
	import { ingredientsStore } from '$lib/nodes';

	let innerWidth = 0,
		innerHeight = 0;

	viewportStore.set({ width: innerWidth, height: innerHeight });

	export let recipe: FullRecipe;
</script>

<Dish
	ingredientId={recipe.mainIngredientId}
	flavors={recipe.mainIngredient.flavors}
	ingredients={writable(recipe.mainIngredient.subIngredients)}
	connections={recipe.mainIngredient.connections}
/>

<svelte:window bind:innerWidth bind:innerHeight />
