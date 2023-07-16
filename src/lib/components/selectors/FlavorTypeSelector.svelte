<script lang="ts">
	import { createEventDispatcher, getContext } from 'svelte';

	import type { FlavorType, Direction } from '$types';
	import { flavorTypes } from '$lib/common/flavors';
	import { viewStateContextKey, type ViewState } from '$view';
	import { recipeStateContextKey, type RecipeState } from '$recipe';
	import { dispatchAddFlavorActions } from '$state/batch/flavor';

	import Selector from './Selector.svelte';

	export let direction: Direction;

	const recipeState: RecipeState = getContext(recipeStateContextKey);
	const viewState: ViewState = getContext(viewStateContextKey);

	const focusedIngredient = viewState.focusedIngredient;

	const dispatch = createEventDispatcher();

	function handleSelect(event: CustomEvent<[string, FlavorType]>) {
		dispatch('destroy');

		const [name, type] = event.detail;
		dispatchAddFlavorActions(recipeState, $focusedIngredient.uuid, direction, type, name);
	}

	function handleClick() {
		dispatch('destroy');
	}

	const options = flavorTypes;
</script>

<svelte:window on:click={handleClick} />

<div>
	<Selector {options} on:select={handleSelect} />
</div>

<style>
	div {
		align-self: center;
		z-index: 1;
	}
</style>
