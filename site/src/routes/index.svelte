<script lang="ts" context="module">
	import { defaultRecipe } from './_recipe';

	/** @type {import('./index').Load} */
	export async function load() {
		storeRecipe(defaultRecipe);

		return {
			props: {
				mainCallForUuid: defaultRecipe.mainCallForUuid
			}
		};
	}
</script>

<script lang="ts">
	import { derived, get } from 'svelte/store';

	import {
		storeRecipe,
		ingredients,
		callsFor,
		flavors,
		connections,
		parameters,
		shaders
	} from '$lib/stores';

	import Pan from '$lib/components/Pan.svelte';
	import Recipe from '$lib/components/Recipe.svelte';

	let innerWidth = 0,
		innerHeight = 0;

	export let mainCallForUuid: string;
	let focusedCallForUuid: string = mainCallForUuid;

	// const ingredientss = derived([callsFor, flavors], ([currentCallsFor, currentFlavors]) => {
	// 	currentCallsFor.forEach((callFor) => {callFor.})
	// });

	const panIngredients = derived(ingredients, (currentIngredients) =>
		Array.from(currentIngredients.values()).filter(
			(ingredient) => ingredient.parentIngredientUuid == focusedCallForUuid
		)
	);

	const focusedIngredientFlavors = derived(
		[callsFor, ingredients, flavors],
		([currentCallsFor, currentIngredients, currentFlavors]) => {
			return Array.from(currentFlavors.values()).filter(
				(flavor) => flavor.ingredientUuid == currentCallsFor.get(focusedCallForUuid)?.ingredientUuid
			);
		}
	);
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<Recipe
	ingredientUuid={focusedCallForUuid}
	focusedFlavors={$focusedIngredientFlavors}
	callsFor={$callsFor}
/>

<Pan
	width={innerWidth}
	height={innerHeight}
	{mainCallForUuid}
	ingredients={$ingredients}
	flavors={$flavors}
	connections={$connections}
	shaders={$shaders}
	parameters={$parameters}
/>
