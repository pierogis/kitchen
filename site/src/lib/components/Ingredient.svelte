<script lang="ts">
	import { getContext } from 'svelte';

	import { draggableAction } from '$lib/common/actions/draggableAction';

	import { Direction, type CallFor, type Flavor, type Ingredient, type Location } from '@types';
	import { viewStateContextKey } from '@view';
	import { recipeStateContextKey } from '@recipe';
	import type { RecipeState } from '@recipe';
	import type { ViewState } from '@view';
	import { ActionType, type Action } from '@state/actions';

	import { PaneContainer } from '@components/paneContainers';
	import { Flavor as FlavorComponent } from '@components/flavors';

	const recipeState: RecipeState = getContext(recipeStateContextKey);
	const viewState: ViewState = getContext(viewStateContextKey);

	export let ingredient: Ingredient;
	export let flavors: Flavor[];
	export let callFor: CallFor;
	export let location: Location;

	let grabTarget: HTMLElement;
	let dragging = false;

	// focus node on focus button
	function handleFocus(_event: MouseEvent) {
		const focusUsageAction: Action<ActionType.FocusUsage> = {
			type: ActionType.FocusUsage,
			params: { usageUuid: callFor.usageUuid }
		};

		recipeState.dispatch(focusUsageAction);
	}

	// delete node on close button
	function handleRemove(_event: MouseEvent) {
		const callForAction: Action<ActionType.DeleteCallsFor> = {
			type: ActionType.DeleteCallsFor,
			params: { callsFor: [callFor] }
		};
		recipeState.dispatch(callForAction);
	}

	const nodeHeaderSize = 12;
	const nodeWidth = 240;

	$: flavorUuids = flavors.map((flavor) => flavor.uuid);

	$: allTerminals = viewState.terminals;

	$: terminals = $allTerminals.filter(
		(terminal) => terminal.flavorUuid && flavorUuids.includes(terminal.flavorUuid)
	);

	let paneContainer: HTMLElement;
	function handlePaneContainer(ev: CustomEvent<HTMLElement>) {
		paneContainer = ev.detail;
	}

	const fillings = viewState.fillings;
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
			<div class="focus no-select" on:mousedown|stopPropagation={handleFocus} />

			<div class="grab no-select" bind:this={grabTarget} class:dragging>
				<div class="grab-dot" />
				<div class="grab-dot" />
			</div>

			<div class="remove no-select" on:mousedown|stopPropagation={handleRemove} />
		</div>
	{/if}
	<PaneContainer
		title={ingredient.name}
		terminals={terminals.filter(
			(terminal) => terminal.flavorUuid && flavorUuids.includes(terminal.flavorUuid)
		)}
		on:paneContainer={handlePaneContainer}
		let:pane
	>
		{#each flavors as flavor, index (flavor.uuid)}
			<FlavorComponent
				{index}
				{flavor}
				filling={fillings.getFilling(
					flavor.uuid,
					callFor.usageUuid,
					flavor.directions.includes(Direction.Out) ? Direction.Out : Direction.In
				)}
				terminals={terminals.filter((terminal) => terminal.flavorUuid == flavor.uuid)}
				usageUuid={callFor.usageUuid}
				{pane}
			/>
		{/each}
	</PaneContainer>
</div>

<style>
	.node {
		position: absolute;
		z-index: 1;
		display: block;

		transform: translate(-50%, 0);
	}
	.header {
		display: flex;
		height: var(--node-header-size);
		margin-bottom: 4px;
	}

	.grab {
		background-color: var(--primary-color);

		box-shadow: 0 2px 4px var(--shadow-color);

		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;

		cursor: grab;
	}

	.grab-dot {
		background-color: var(--button-color-hover);
		border-radius: 50%;
		height: 4px;
		width: 4px;
		margin: 2px;
	}

	.focus,
	.remove {
		box-shadow: 0 2px 4px var(--primary-color-shadow);
		width: var(--node-header-size);
		cursor: pointer;
	}

	.remove:hover,
	.focus:hover,
	.grab:hover {
		filter: brightness(90%) saturate(150%);
	}

	.focus {
		background-color: var(--focus-color);

		border-radius: 6px 0px 0px 6px;

		margin-right: 5px;
	}

	.remove {
		background-color: var(--remove-color);

		border-radius: 0px 6px 6px 0px;

		margin-left: 5px;
	}
</style>
