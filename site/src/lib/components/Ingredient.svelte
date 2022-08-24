<script lang="ts">
	import { getContext } from 'svelte';

	import { draggableAction } from '$lib/common/actions/draggableAction';

	import { Direction, type CallFor, type Flavor, type Ingredient, type Location } from '@types';
	import { viewStateContextKey } from '@view';
	import { recipeStateContextKey } from '@recipe';
	import type { RecipeState } from '@recipe';
	import type { ViewState } from '@view';
	import { ActionType, type Action } from '@state/actions';

	import { DragHeader } from '@components';
	import { PaneContainer } from '@components/paneContainers';
	import { Flavor as FlavorComponent } from '@components/flavors';

	const recipeState: RecipeState = getContext(recipeStateContextKey);
	const viewState: ViewState = getContext(viewStateContextKey);

	export let ingredient: Ingredient;
	export let flavors: Flavor[];
	export let callFor: CallFor;
	export let location: Location;

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

	const allTerminals = viewState.terminals;

	$: terminals = $allTerminals.filter(
		(terminal) => terminal.flavorUuid && flavorUuids.includes(terminal.flavorUuid)
	);

	let dragTarget: HTMLElement;
</script>

<div
	class="node no-select"
	style:left="{location.x}px"
	style:max-width="{nodeWidth}px"
	style:top="{location.y - nodeHeaderSize / 2}px"
	style:--node-header-size="{nodeHeaderSize}px"
	bind:this={dragTarget}
>
	{#if dragTarget}
		<DragHeader {handleFocus} {handleRemove} {dragTarget} />
	{/if}
	<PaneContainer
		title={ingredient.name}
		terminals={terminals.filter(
			(terminal) => terminal.flavorUuid && flavorUuids.includes(terminal.flavorUuid)
		)}
		let:pane
	>
		{#each flavors as flavor, index (flavor.uuid)}
			{@const filling = viewState.fillings.getFilling(
				flavor.uuid,
				callFor.usageUuid,
				flavor.directions.includes(Direction.Out) ? Direction.Out : Direction.In
			)}
			<FlavorComponent
				{index}
				{flavor}
				{filling}
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
</style>
