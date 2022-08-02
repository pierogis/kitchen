<script lang="ts">
	import { get } from 'svelte/store';

	import { Direction } from '@types';

	import type { ViewState } from '@view';
	import type { RecipeState } from '@recipe';

	import { PrimitiveSelector, Dock, Ingredient as IngredientComponent } from '@components';
	import { Cable as CableComponent } from '@components/cables';
	import { LiveTerminal } from '@components/terminals';

	export let recipeState: RecipeState;
	export let viewState: ViewState;

	export let width: number;
	export let height: number;

	const focusedIngredient = viewState.focusedIngredient;
	const dockedFlavors = viewState.dockedFlavors;
	const preps = viewState.preps;
	const nodes = viewState.nodes;
	const cables = viewState.cables;
	const liveTerminal = viewState.liveTerminal;

	const focusedUsageUuid = recipeState.focusedUsageUuid;

	const pathStrokeWidth = 2;

	let selectingPrimitive = false;

	function handleDoubleClick(event: MouseEvent) {
		event.preventDefault();

		const elements = document.elementsFromPoint(event.clientX, event.clientY);
		// the top most element clicked on should be an svg
		if (elements[0].tagName == 'svg') {
			selectingPrimitive = true;
		}
	}

	function handleKeyPress(event: KeyboardEvent & { currentTarget: EventTarget & Window }) {
		if (event.repeat) return;

		if ((event.ctrlKey || event.metaKey) && event.key == 'e') {
			event.preventDefault();
			viewState.editMode.update(($editMode) => !$editMode);
		}
	}
</script>

<svelte:window on:dblclick={handleDoubleClick} on:keydown={handleKeyPress} />

{#each $nodes as node (node.callFor.uuid)}
	<IngredientComponent
		ingredient={node.ingredient}
		flavors={node.flavors}
		callFor={node.callFor}
		location={node.location}
	/>
{/each}

{#if $liveTerminal}
	<LiveTerminal terminal={$liveTerminal} />
{/if}

<svg style:--path-stroke-width="{pathStrokeWidth}px" {width} {height}>
	{#each $cables as cable (cable.connectionUuid)}
		<CableComponent {cable} />
	{/each}
</svg>

<Dock
	direction={Direction.In}
	preps={$preps.filter((prep) => prep.direction == Direction.In)}
	flavors={$dockedFlavors.filter(
		(flavor) => flavor.directions.includes(Direction.Out) && !flavor.prepUuid
	)}
	focusedUsageUuid={$focusedUsageUuid}
/>
<Dock
	direction={Direction.Out}
	preps={$preps.filter((prep) => prep.direction == Direction.Out)}
	flavors={$dockedFlavors.filter(
		(flavor) => flavor.directions.includes(Direction.In) && !flavor.prepUuid
	)}
	focusedUsageUuid={$focusedUsageUuid}
/>

{#if selectingPrimitive}
	<PrimitiveSelector
		coordinates={get(viewState.cursor.coordinates)}
		{recipeState}
		focusedIngredientUuid={get(focusedIngredient).uuid}
		on:destroy={() => {
			selectingPrimitive = false;
		}}
	/>
{/if}

<style>
	svg {
		display: block;
	}
</style>
