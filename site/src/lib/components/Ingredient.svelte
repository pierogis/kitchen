<script lang="ts">
	import { getContext } from 'svelte';
	import { derived } from 'svelte/store';

	import type { CallFor, Flavor, Ingredient, Location } from '@types';
	import { draggableAction } from '$lib/common/actions/draggableAction';

	import { recipeStateContextKey, viewStateContextKey } from '@state';
	import type { RecipeState } from '@recipe';
	import type { ViewState } from '@view';
	import { dispatchDeleteCallForActions } from '@state/batch/callFor';

	import Pane from '@components/tweakpane/Pane.svelte';
	import FlavorComponent from '@components/Flavor.svelte';

	const recipeState: RecipeState = getContext(recipeStateContextKey);
	const viewState: ViewState = getContext(viewStateContextKey);

	export let ingredient: Ingredient;
	export let flavors: Flavor[];
	export let callFor: CallFor;
	export let location: Location;

	let grabTarget: HTMLElement;
	let dragging = false;

	// delete node on close button
	function handleRemove(_event: MouseEvent) {
		dispatchDeleteCallForActions(recipeState, callFor);
	}

	const nodeHeaderSize = 12;
	const nodeWidth = 240;

	$: terminals = viewState.terminals;
	let paneContainer: HTMLElement;
</script>

<div
	class="node no-select"
	style:left="{location.x}px"
	style:max-width="{nodeWidth}px"
	style:top="{location.y - nodeHeaderSize / 2}px"
	style:--node-header-size="{nodeHeaderSize}px"
	use:draggableAction={grabTarget}
>
	{#if paneContainer}
		<div class="header">
			<div class="grab" bind:this={grabTarget} class:dragging>
				<div class="grab-dot" />
				<div class="grab-dot" />
			</div>

			<div class="remove" on:click={handleRemove} />
		</div>
	{/if}
	<div bind:this={paneContainer} class="no-select">
		{#if paneContainer}
			<Pane let:pane container={paneContainer} title={ingredient.name}>
				{#if pane}
					{#each flavors as flavor, index (flavor.uuid)}
						<FlavorComponent
							{...viewState.payloads.getPayload(flavor.uuid)}
							terminals={derived(terminals, (currentTerminals) =>
								currentTerminals.filter((terminal) => terminal.flavorUuid == flavor.uuid)
							)}
							{index}
							{flavor}
							folder={pane}
						/>
					{/each}
				{/if}
			</Pane>
		{/if}
	</div>
</div>

<style>
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
