<script lang="ts">
	import { getContext } from 'svelte';
	import { writable } from 'svelte/store';

	import { type Prep, PrepType, Direction } from '@types';
	import { prepTypes } from '$lib/common/preps';
	import type { Terminal } from '@view';
	import { recipeStateContextKey, type RecipeState } from '@recipe';
	import {
		dispatchUpdatePrepNameActions,
		dispatchChangePrepTypeActions,
		dispatchDeletePrepActions
	} from '$lib/state/batch/prep';

	import { Input, Button } from '@components/tweakpane';
	import { TerminalRack } from '@components/terminals';
	import { PaneContainer } from '.';

	export let prep: Prep<PrepType>;
	export let terminals: Terminal[];
	export let direction: Direction;

	let recipeState: RecipeState = getContext(recipeStateContextKey);

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
		onChange={({ value: name }) => dispatchUpdatePrepNameActions(recipeState, prep.uuid, name)}
	/>
	<Input
		folder={pane}
		paramsStore={writable({ type: prep.type })}
		key={'type'}
		inputParams={{ options: prepTypes }}
		onChange={({ value: type }) =>
			dispatchChangePrepTypeActions(recipeState, prep.uuid, prep.ingredientUuid, direction, type)}
	/>
	<Button
		folder={pane}
		title={'delete'}
		onClick={() => dispatchDeletePrepActions(recipeState, prep.uuid)}
	/>
	{#if terminals.length > 0}
		<TerminalRack parentElement={paneContainer} {terminals} direction={oppositeDirection} />
	{/if}
</PaneContainer>
