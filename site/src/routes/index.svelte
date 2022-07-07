<script lang="ts" context="module">
	import { storeRecipe } from '@state';
	import { recipeStateContextKey } from '@recipe';
	import { viewStateContextKey } from '@view';

	import { defaultRecipe } from './_recipe';
	import { shaderRecipe } from './_shader';

	/** @type {import('./index').Load} */
	export async function load() {
		return {
			props: {
				recipe: shaderRecipe
			}
		};
	}
</script>

<script lang="ts">
	import { setContext } from 'svelte';

	import type { FullRecipe } from '@types';
	import { readableViewState } from '@view';

	import Pan from '@components/Pan.svelte';
	import Recipe from '@components/Recipe.svelte';

	let innerWidth: number, innerHeight: number;

	export let recipe: FullRecipe;

	const recipeState = storeRecipe(recipe);
	const viewState = readableViewState(recipeState);

	setContext(recipeStateContextKey, recipeState);
	setContext(viewStateContextKey, viewState);

	const handleMouseMove = (ev: MouseEvent) => {
		viewState.cursor.coordinates.set({ x: ev.clientX, y: ev.clientY });
	};
</script>

<svelte:window
	bind:innerWidth
	bind:innerHeight
	on:scroll|preventDefault={() => {}}
	on:mousemove={handleMouseMove}
/>

<svelte:head>
	<title>kitchen</title>
</svelte:head>

<Recipe
	focusedUsageUuid={recipeState.focusedUsageUuid}
	dockedFlavors={viewState.dockedFlavors}
	nodes={viewState.nodes}
	cables={viewState.cables}
	terminalsCoordinates={viewState.terminalsCoordinates}
	liveTerminal={viewState.liveTerminal}
	width={innerWidth}
	height={innerHeight}
/>

<Pan width={innerWidth} height={innerHeight} {recipeState} {viewState} />
