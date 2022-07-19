<script lang="ts" context="module">
	import { storeRecipe } from '@state';
	import { recipeStateContextKey } from '@recipe';
	import { viewStateContextKey } from '@view';

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
	import { onMount, setContext } from 'svelte';
	import { derived, get } from 'svelte/store';

	import * as THREE from 'three';

	import type { FullRecipe } from '@types';
	import { readableViewState } from '@view';

	import Pan from '@components/Pan.svelte';
	import Recipe from '@components/Recipe.svelte';
	import { ActionType } from '$lib/state/actions';

	let innerWidth: number, innerHeight: number;

	export let recipe: FullRecipe;

	const recipeState = storeRecipe(recipe);
	const viewState = readableViewState(recipeState);

	setContext(recipeStateContextKey, recipeState);
	setContext(viewStateContextKey, viewState);

	const handleMouseMove = (ev: MouseEvent) => {
		viewState.cursor.coordinates.set({ x: ev.clientX, y: ev.clientY });
	};

	const parentUsageUuid = derived(
		viewState.parentUsageUuid,
		($parentUsageUuid) => $parentUsageUuid
	);
	function handleUnfocusClick(ev: MouseEvent) {
		if (ev.button == 0 && $parentUsageUuid) {
			recipeState.dispatch({
				type: ActionType.FocusUsage,
				params: { usageUuid: $parentUsageUuid }
			});
		}
	}

	onMount(() => {
		const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
		camera.position.z = 2;
		viewState.defaultCamera.set(camera);
	});
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

{#if $parentUsageUuid}
	<button on:click={handleUnfocusClick} />
{/if}

<Recipe
	focusedUsageUuid={recipeState.focusedUsageUuid}
	dockedFlavors={viewState.dockedFlavors}
	preps={viewState.preps}
	nodes={viewState.nodes}
	cables={viewState.cables}
	liveTerminal={viewState.liveTerminal}
	width={innerWidth}
	height={innerHeight}
/>

<Pan width={innerWidth} height={innerHeight} {recipeState} {viewState} />

<style>
	button {
		position: fixed;
	}
</style>
