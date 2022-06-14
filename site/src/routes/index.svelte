<script lang="ts" context="module">
	import { defaultRecipe } from './_recipe';
	import { storeRecipe } from '$lib/state';

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
	import Pan from '$lib/components/Pan.svelte';
	import Recipe from '$lib/components/Recipe.svelte';
	import type { FullRecipe } from '$lib/common/types';
	import { readableView } from '$lib/state/stores/view';
	import { setContext } from 'svelte';

	let innerWidth = 0,
		innerHeight = 0;

	export let recipe: FullRecipe;

	const state = storeRecipe(recipe);
	const view = readableView(state);

	setContext('state', state);
	setContext('view', view);
</script>

<svelte:window bind:innerWidth bind:innerHeight on:scroll|preventDefault={() => {}} />

<Recipe />

<Pan
	width={innerWidth}
	height={innerHeight}
	mainCallForUuid={recipe.mainCallForUuid}
	ingredients={$state.ingredients}
	flavors={$state.flavors}
	connections={$state.connections}
	shaders={$state.shaders}
	parameters={$state.parameters}
/>
