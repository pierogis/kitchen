<script lang="ts">
	import { getContext } from 'svelte';
	import { writable } from 'svelte/store';

	import type { TpChangeEvent } from 'tweakpane';

	import { type Flavor, Direction, FlavorType } from '@types';
	import { flavorTypes } from '$lib/common/flavors';
	import { recipeStateContextKey, type RecipeState } from '@recipe';
	import type { Terminal } from '@view';
	import {
		dispatchUpdateFlavorTypeActions,
		dispatchUpdateFlavorNameActions
	} from '@state/batch/flavor';

	import { Input, Folder } from '@components/tweakpane';
	import { TerminalRack } from '@components/terminals';
	import PaneContainer from './PaneContainer.svelte';

	export let flavors: Flavor[];
	export let terminals: Terminal[];
	export let direction: Direction;

	const recipeState: RecipeState = getContext(recipeStateContextKey);

	function handleFlavorNameUpdate(flavor: Flavor, event: TpChangeEvent<string>) {
		dispatchUpdateFlavorNameActions(recipeState, flavor.uuid, event.value);
	}
	function handleFlavorTypeUpdate(flavor: Flavor, event: TpChangeEvent<FlavorType>) {
		dispatchUpdateFlavorTypeActions(recipeState, flavor.uuid, event.value);
	}

	$: inTerminals = terminals.filter((terminal) => terminal.direction == Direction.In);
	$: outTerminals = terminals.filter((terminal) => terminal.direction == Direction.Out);
</script>

<PaneContainer title={'flavors'} {terminals} {direction} let:pane>
	{#each flavors as flavor, index (flavor.uuid)}
		<Folder {pane} title={flavor.name} {index} let:folder let:folderContainer>
			{#if folderContainer}
				<Input
					{folder}
					paramsStore={writable({ name: flavor.name })}
					key={'name'}
					onChange={(event) => handleFlavorNameUpdate(flavor, event)}
				/>
				<Input
					{folder}
					paramsStore={writable({ type: flavor.type })}
					key={'type'}
					onChange={(event) => handleFlavorTypeUpdate(flavor, event)}
					inputParams={{ options: flavorTypes }}
				/>
				{#if inTerminals.length > 0 && direction != Direction.In}
					<TerminalRack
						parentElement={folderContainer}
						terminals={inTerminals.filter(
							(terminal) => terminal.flavorUuid == flavor.uuid && terminal.direction != direction
						)}
						direction={Direction.In}
					/>
				{/if}
				{#if outTerminals.length > 0 && direction != Direction.Out}
					<TerminalRack
						parentElement={folderContainer}
						terminals={outTerminals.filter(
							(terminal) => terminal.flavorUuid == flavor.uuid && terminal.direction != direction
						)}
						direction={Direction.Out}
					/>
				{/if}
			{/if}
		</Folder>
	{/each}
</PaneContainer>
