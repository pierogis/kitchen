<script lang="ts">
	import { getContext } from 'svelte';
	import { writable } from 'svelte/store';

	import type { Pane } from 'tweakpane';

	import { type FullPrep, PrepType, Direction } from '@types';
	import { prepTypes } from '$lib/common/preps';
	import type { Terminal } from '@view';
	import { recipeStateContextKey, type RecipeState } from '@recipe';
	import {
		dispatchUpdatePrepNameActions,
		dispatchChangePrepTypeActions,
		dispatchDeletePrepActions
	} from '$lib/state/batch/prep';

	import { Input, Button, Tab } from '@components/tweakpane';
	import { TerminalRack } from '@components/terminals';
	import { EditFlavors } from '@components/paneContainers';

	export let pane: Pane;
	export let paneContainer: HTMLElement;

	export let prep: FullPrep<PrepType>;
	export let terminals: Terminal[];
	export let direction: Direction;

	let recipeState: RecipeState = getContext(recipeStateContextKey);

	$: oppositeDirection = direction == Direction.Out ? Direction.In : Direction.Out;
	$: terminals = terminals.filter((terminal) => terminal.direction == oppositeDirection);

	let showFlavorsTab = false;
</script>

<Tab
	parent={pane}
	pages={[{ title: prep.name }, { title: 'flavors' }]}
	let:tab
	on:select={(event) => {
		showFlavorsTab = event.detail.index == 1;
	}}
>
	<Input
		parent={tab.pages[0]}
		paramsStore={writable({ name: prep.name })}
		key={'name'}
		onChange={({ value: name }) => dispatchUpdatePrepNameActions(recipeState, prep.uuid, name)}
	/>
	<Input
		parent={tab.pages[0]}
		paramsStore={writable({ type: prep.type })}
		key={'type'}
		inputParams={{ view: 'grouplist', optgroups: prepTypes }}
		onChange={({ value: type }) =>
			dispatchChangePrepTypeActions(recipeState, prep.uuid, prep.ingredientUuid, direction, type)}
	/>
	<Button
		parent={tab.pages[0]}
		title={'delete'}
		onClick={() => dispatchDeletePrepActions(recipeState, prep.uuid)}
	/>
	<EditFlavors
		tab={{ api: tab, pageIndex: 1 }}
		flavors={prep.flavors}
		terminals={showFlavorsTab ? terminals : []}
		{direction}
		allowChangeType={false}
		allowDelete={false}
	/>
</Tab>

{#if !showFlavorsTab && terminals.length > 0}
	<TerminalRack parentElement={paneContainer} {terminals} direction={oppositeDirection} />
{/if}
