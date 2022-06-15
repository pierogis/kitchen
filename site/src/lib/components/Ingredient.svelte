<script lang="ts">
	import { getContext } from 'svelte';
	import { derived } from 'svelte/store';

	import type { CallFor, Flavor, Ingredient, Location } from '$lib/common/types';
	import { draggableAction } from '$lib/common/actions/draggableAction';

	import { recipeStateContextKey, viewStateContextKey } from '$lib/state';
	import { ActionType } from '$lib/state/actions';
	import type { RecipeState } from '$lib/state/stores/recipe';
	import type { ViewState } from '$lib/state/stores/view';

	import Pane from './tweakpane/Pane.svelte';
	import FlavorComponent from './Flavor.svelte';

	const recipeState: RecipeState = getContext(recipeStateContextKey);
	const viewState: ViewState = getContext(viewStateContextKey);

	export let ingredient: Ingredient;
	export let flavors: Flavor[];
	export let callFor: CallFor;
	export let location: Location;

	let grabTarget: HTMLElement;
	let dragging = false;

	function centerOnInitialLocationAction(element: HTMLElement) {
		const midpoint = element.getBoundingClientRect().width / 2;
		element.style.left = location.x - midpoint + 'px';
	}

	// delete node on close button
	function handleRemove(_event: MouseEvent) {
		recipeState.dispatch({
			type: ActionType.DeleteIngredient,
			params: {
				ingredient: ingredient,
				flavors: flavors,
				callFor,
				location: location
			}
		});
	}

	const nodeHeaderSize = 12;

	$: cables = viewState.cables;
</script>

<div
	class="node no-select"
	style="top: {location.y - nodeHeaderSize / 2}px; --node-header-size: {nodeHeaderSize}px"
	use:centerOnInitialLocationAction
	use:draggableAction={grabTarget}
>
	<div class="header">
		<div class="grab" bind:this={grabTarget} class:dragging>
			<div class="grab-dot" />
			<div class="grab-dot" />
		</div>

		<div class="remove" on:click={handleRemove} />
	</div>
	<Pane let:pane title={ingredient.name}>
		{#if pane}
			{#each flavors as flavor, i (i)}
				<FlavorComponent
					cables={derived(cables, (currentCables) =>
						currentCables.filter(
							(cable) => cable.outFlavorUuid == flavor.uuid || cable.inFlavorUuid == flavor.uuid
						)
					)}
					{flavor}
					folder={pane}
				/>
			{/each}
		{/if}
	</Pane>
</div>

<style>
	.no-select {
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
	}
	.node {
		position: absolute;
		z-index: 1;
		display: block;
	}
	.header {
		display: flex;
		height: var(--node-header-size);
		margin-bottom: 4px;
	}

	.grab {
		background-color: var(--primary-color);

		box-shadow: 0 2px 4px var(--shadow-color);

		border-radius: 6px 0px 0px 6px;

		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;

		cursor: grab;
	}
	.grab:hover {
		filter: brightness(90%) saturate(150%);
	}

	.grab-dot {
		background-color: var(--button-color-hover);
		border-radius: 50%;
		height: 4px;
		width: 4px;
		margin: 2px;
	}

	.remove {
		background-color: var(--remove-color);
		box-shadow: 0 2px 4px var(--primary-color-shadow);

		border-radius: 0px 6px 6px 0px;

		width: var(--node-header-size);
		margin-left: 5px;
	}

	.remove:hover {
		filter: brightness(90%) saturate(150%);
		cursor: pointer;
	}
</style>
