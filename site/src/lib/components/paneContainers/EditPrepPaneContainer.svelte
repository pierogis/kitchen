<script lang="ts">
	import { getContext } from 'svelte';
	import { writable } from 'svelte/store';

	import type { TpChangeEvent } from 'tweakpane';

	import { type Prep, PrepType, Direction } from '@types';
	import { prepTypes } from '$lib/common/preps';
	import type { Terminal } from '@view';
	import { recipeStateContextKey, type RecipeState } from '@recipe';
	import {
		dispatchUpdatePrepNameActions,
		dispatchChangePrepTypeActions
	} from '$lib/state/batch/prep';

	import { Input } from '@components/tweakpane';
	import { TerminalRack } from '@components/terminals';
	import { PaneContainer } from '.';

	export let prep: Prep<PrepType>;
	export let terminals: Terminal[];
	export let direction: Direction;

	let recipeState: RecipeState = getContext(recipeStateContextKey);

	function handlePrepNameUpdate(event: TpChangeEvent<string>) {
		dispatchUpdatePrepNameActions(recipeState, prep.uuid, event.value);
	}
	function handlePrepTypeUpdate(event: TpChangeEvent<PrepType>) {
		dispatchChangePrepTypeActions(
			recipeState,
			prep.uuid,
			prep.ingredientUuid,
			direction,
			event.value
		);
	}

	$: oppositeDirection = direction == Direction.Out ? Direction.In : Direction.Out;
	$: terminals = terminals.filter((terminal) => terminal.direction == oppositeDirection);

	let paneContainer: HTMLElement;
</script>

<PaneContainer
	{terminals}
	{direction}
	let:pane
	on:paneContainer={(event) => (paneContainer = event.detail)}
>
	<Input
		folder={pane}
		paramsStore={writable({ name: prep.name })}
		key={'name'}
		onChange={(event) => handlePrepNameUpdate(event)}
	/>
	<Input
		folder={pane}
		paramsStore={writable({ type: prep.type })}
		key={'type'}
		inputParams={{ options: prepTypes }}
		onChange={(event) => handlePrepTypeUpdate(event)}
	/>
	{#if terminals.length > 0}
		<TerminalRack parentElement={paneContainer} {terminals} direction={oppositeDirection} />
	{/if}
</PaneContainer>
