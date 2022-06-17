<script lang="ts" context="module">
	import { defaultRecipe } from './_recipe';
	import { recipeStateContextKey, storeRecipe, viewStateContextKey } from '$lib/state';

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
	import { readableViewState } from '$lib/state/stores/view';
	import { setContext } from 'svelte';

	let innerWidth = 0,
		innerHeight = 0;

	export let recipe: FullRecipe;

	const recipeState = storeRecipe(recipe);
	const viewState = readableViewState(recipeState);

	setContext(recipeStateContextKey, recipeState);
	setContext(viewStateContextKey, viewState);

	const handleMouseMove = (ev: MouseEvent) => {
		viewState.cursorCoordinates.set({ x: ev.clientX, y: ev.clientY });
	};
</script>

<svelte:window
	bind:innerWidth
	bind:innerHeight
	on:scroll|preventDefault={() => {}}
	on:mousemove={handleMouseMove}
/>

<Recipe nodes={viewState.nodes} cables={viewState.cables} liveTerminal={viewState.liveTerminal} />

<Pan
	width={innerWidth}
	height={innerHeight}
	mainCallForUuid={recipe.mainCallForUuid}
	ingredients={$recipeState.ingredients}
	flavors={$recipeState.flavors}
	connections={$recipeState.connections}
	shaders={$recipeState.shaders}
	parameters={$recipeState.parameters}
	cursorCoordinates={viewState.cursorCoordinates}
/>
