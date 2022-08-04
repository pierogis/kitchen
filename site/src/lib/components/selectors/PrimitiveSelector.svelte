<script lang="ts">
	import { createEventDispatcher, getContext } from 'svelte';

	import { Direction, type Coordinates, type PrepType } from '@types';
	import { prepTypes } from '$lib/common/preps';
	import { recipeStateContextKey, type RecipeState } from '@recipe';
	import { viewStateContextKey, type ViewState } from '@view';
	import { dispatchIngredientCreationActions } from '@state/batch/ingredient';

	import Selector from './Selector.svelte';

	export let coordinates: Coordinates;

	const recipeState: RecipeState = getContext(recipeStateContextKey);
	const viewState: ViewState = getContext(viewStateContextKey);

	const focusedIngredient = viewState.focusedIngredient;

	const dispatch = createEventDispatcher();

	function handleSelect(event: CustomEvent<[string, PrepType]>) {
		dispatch('destroy');
		dispatchIngredientCreationActions(
			recipeState,
			coordinates,
			$focusedIngredient.uuid,
			[],
			[{ type: event.detail[1], direction: Direction.Out }]
		);
	}

	function handleClick() {
		dispatch('destroy');
	}

	const options = prepTypes;
</script>

<svelte:window on:click={handleClick} />

<div style:left="{coordinates.x}px" style:top="{coordinates.y}px">
	<Selector {options} on:select={handleSelect} />
</div>

<style>
	div {
		position: absolute;
	}
</style>
