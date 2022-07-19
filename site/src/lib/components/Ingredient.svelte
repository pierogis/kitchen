<script lang="ts">
	import { getContext } from 'svelte';
	import { derived } from 'svelte/store';

	import { draggableAction } from '$lib/common/actions/draggableAction';

	import { type CallFor, type Flavor, type Ingredient, type Location, Direction } from '@types';
	import { viewStateContextKey } from '@view';
	import { recipeStateContextKey } from '@recipe';
	import type { RecipeState } from '@recipe';
	import type { ViewState } from '@view';
	import { ActionType, type Action } from '@state/actions';

	import Pane from '@components/tweakpane/Pane.svelte';
	import FlavorComponent from '@components/Flavor.svelte';
	import TerminalRack from './TerminalRack.svelte';

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

	let folded = false;
	function handleFold() {
		folded = !folded;
	}

	const terminals = derived(viewState.terminals, ($terminals) => {
		const flavorUuids = flavors.map((flavor) => flavor.uuid);
		return $terminals.filter(
			(terminal) => terminal.flavorUuid && flavorUuids.includes(terminal.flavorUuid)
		);
	});
	$: inTerminals = $terminals.filter((terminal) => terminal.direction == Direction.In);
	$: outTerminals = $terminals.filter((terminal) => terminal.direction == Direction.Out);
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
			<div class="focus no-select" on:mousedown|stopPropagation={handleFocus} />

			<div class="grab no-select" bind:this={grabTarget} class:dragging>
				<div class="grab-dot" />
				<div class="grab-dot" />
			</div>

			<div class="remove no-select" on:mousedown|stopPropagation={handleRemove} />
		</div>
	{/if}
	<div bind:this={paneContainer} class="no-select pane-container">
		{#if paneContainer}
			<Pane let:pane container={paneContainer} title={ingredient.name} on:fold={handleFold}>
				{#if pane}
					{#if !folded}
						{#each flavors as flavor, index (flavor.uuid)}
							<FlavorComponent
								filling={viewState.fillings.getFilling(
									flavor.uuid,
									callFor.usageUuid,
									flavor.directions.includes(Direction.Out) ? Direction.Out : Direction.In
								)}
								terminals={derived(terminals, (currentTerminals) =>
									currentTerminals.filter((terminal) => terminal.flavorUuid == flavor.uuid)
								)}
								{index}
								{flavor}
								usageUuid={callFor.usageUuid}
								folder={pane}
							/>
						{/each}
					{/if}
				{/if}
			</Pane>

			{#if folded}
				{#if inTerminals.length > 0}
					<TerminalRack
						parentElement={paneContainer}
						terminals={inTerminals}
						direction={Direction.In}
					/>
				{/if}
				{#if outTerminals.length > 0}
					<TerminalRack
						parentElement={paneContainer}
						terminals={outTerminals}
						direction={Direction.Out}
					/>
				{/if}
			{/if}
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

	.pane-container {
		display: flex;
		align-items: center;
	}
</style>
