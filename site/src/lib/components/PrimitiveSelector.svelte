<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	import type { Coordinates, PrepType } from '@types';
	import type { RecipeState } from '@recipe';
	import { dispatchIngredientCreationActions } from '@state/batch/ingredient';
	import { prepPrimitives, type PrepPrimitive } from '$lib/common/preps';

	export let coordinates: Coordinates;

	export let recipeState: RecipeState;
	export let focusedIngredientUuid: string;

	const dispatch = createEventDispatcher();

	function handleSelect() {
		dispatchIngredientCreationActions(
			recipeState,
			coordinates,
			focusedIngredientUuid,
			[],
			[selected]
		);
		dispatch('destroy');
	}

	function handleClick() {
		dispatch('destroy');
	}

	let selected: PrepPrimitive<PrepType>;

	const options = Object.values(prepPrimitives);
</script>

<svelte:window on:click={handleClick} />

<div style:left="{coordinates.x}px" style:top="{coordinates.y}px">
	<select bind:value={selected} on:change={handleSelect}>
		{#each options as primitive}
			<option value={primitive}>{primitive.name}</option>
		{/each}
	</select>
</div>

<style>
	div {
		position: absolute;
	}
</style>
