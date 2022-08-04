<script lang="ts">
	import { getContext } from 'svelte';
	import { writable } from 'svelte/store';

	import { type Flavor, Direction } from '@types';
	import { flavorTypes } from '$lib/common/flavors';
	import { recipeStateContextKey, type RecipeState } from '@recipe';
	import type { Terminal } from '@view';
	import {
		dispatchUpdateFlavorTypeActions,
		dispatchUpdateFlavorNameActions,
		dispatchDeleteFlavorActions
	} from '@state/batch/flavor';

	import { Input, Folder, Button } from '@components/tweakpane';
	import { TerminalRack } from '@components/terminals';
	import PaneContainer from './PaneContainer.svelte';

	export let flavors: Flavor[];
	export let terminals: Terminal[];
	export let direction: Direction;

	const recipeState: RecipeState = getContext(recipeStateContextKey);

	$: oppositeDirection = direction == Direction.Out ? Direction.In : Direction.Out;
	$: terminals = terminals.filter((terminal) => terminal.direction == oppositeDirection);
</script>

<PaneContainer title={'flavors'} {terminals} {direction} let:pane>
	{#each flavors as flavor, index (flavor.uuid)}
		<Folder {pane} title={flavor.name} {index} let:folder let:folderContainer>
			{#if folderContainer}
				<Input
					{folder}
					paramsStore={writable({ name: flavor.name })}
					key={'name'}
					onChange={({ value: name }) =>
						dispatchUpdateFlavorNameActions(recipeState, flavor.uuid, name)}
				/>
				<Input
					{folder}
					paramsStore={writable({ type: flavor.type })}
					key={'type'}
					onChange={({ value: type }) =>
						dispatchUpdateFlavorTypeActions(recipeState, flavor.uuid, type)}
					inputParams={{ options: flavorTypes }}
				/>
				<Button
					{folder}
					title={'delete'}
					onClick={() => dispatchDeleteFlavorActions(recipeState, flavor.uuid)}
				/>
				{#if terminals.length > 0}
					<TerminalRack
						parentElement={folderContainer}
						terminals={terminals.filter(
							(terminal) => terminal.flavorUuid == flavor.uuid && terminal.direction != direction
						)}
						direction={oppositeDirection}
					/>
				{/if}
			{/if}
		</Folder>
	{/each}
</PaneContainer>
