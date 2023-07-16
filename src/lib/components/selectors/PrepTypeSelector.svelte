<script lang="ts">
	import { createEventDispatcher, getContext } from 'svelte';

	import type { PrepType, Direction } from '$types';
	import { prepTypes } from '$lib/common/preps';
	import { viewStateContextKey, type ViewState } from '$view';
	import { recipeStateContextKey, type RecipeState } from '$recipe';
	import { dispatchAddPrepActions } from '$state/batch/prep';

	import Selector from './Selector.svelte';

	export let direction: Direction;

	const recipeState: RecipeState = getContext(recipeStateContextKey);
	const viewState: ViewState = getContext(viewStateContextKey);

	const focusedIngredient = viewState.focusedIngredient;

	const dispatch = createEventDispatcher();

	function handleSelect(event: CustomEvent<[string, PrepType]>) {
		dispatch('destroy');
		dispatchAddPrepActions(recipeState, $focusedIngredient.uuid, direction, event.detail[1]);
	}

	function handleClick() {
		dispatch('destroy');
	}
</script>

<svelte:window on:click={handleClick} />

<div>
	<Selector optgroups={prepTypes} on:select={handleSelect} />
</div>

<style>
	div {
		align-self: center;
		z-index: 1;
	}
</style>
