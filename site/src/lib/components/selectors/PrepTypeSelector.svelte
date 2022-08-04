<script lang="ts">
	import { createEventDispatcher, getContext } from 'svelte';

	import type { Coordinates, PrepType } from '@types';
	import { prepTypes } from '$lib/common/preps';
	import { viewStateContextKey, type ViewState } from '@view';
	import { recipeStateContextKey, type RecipeState } from '@recipe';
	import { dispatchAddPrepActions } from '@state/batch/prep';

	import Selector from './Selector.svelte';

	export let coordinates: Coordinates;

	const recipeState: RecipeState = getContext(recipeStateContextKey);
	const viewState: ViewState = getContext(viewStateContextKey);

	const focusedIngredient = viewState.focusedIngredient;

	const dispatch = createEventDispatcher();

	function handleSelect(event: CustomEvent<[string, PrepType]>) {
		dispatch('destroy');
		dispatchAddPrepActions(recipeState, $focusedIngredient.uuid, event.detail[1]);
	}

	function handleClick() {
		dispatch('destroy');
	}

	const options = prepTypes;
</script>

<svelte:window on:click={handleClick} />

<Selector {options} x={coordinates.x} y={coordinates.y} on:select={handleSelect} />
