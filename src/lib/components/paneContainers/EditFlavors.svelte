<script lang="ts">
	import { getContext } from 'svelte';
	import { writable } from 'svelte/store';

	import type { Pane, TabApi } from 'tweakpane';

	import { type Flavor, Direction } from '@types';
	import { flavorTypes } from '$lib/common/flavors';
	import { recipeStateContextKey, type RecipeState } from '@recipe';
	import type { Terminal } from '@view';
	import {
		dispatchUpdateFlavorTypeActions,
		dispatchUpdateFlavorNameActions,
		dispatchDeleteFlavorActions
	} from '@state/batch/flavor';

	import { Input, Folder, Button } from '@pierogis/svelte-tweakpane';
	import { TerminalRack } from '@components/terminals';

	export let pane: Pane | undefined = undefined;
	export let tab: { api: TabApi; pageIndex: number } | undefined = undefined;
	export let flavors: Flavor[];
	export let terminals: Terminal[];
	export let direction: Direction;
	export let allowChangeType = true;
	export let allowDelete = true;

	if ((pane && tab) || (!pane && !tab)) throw 'either pane or tab must be provided';

	const recipeState: RecipeState = getContext(recipeStateContextKey);

	$: oppositeDirection = direction == Direction.Out ? Direction.In : Direction.Out;
	$: terminals = terminals.filter((terminal) => terminal.direction == oppositeDirection);
</script>

{#each flavors as flavor, index (flavor.uuid)}
	<Folder {pane} {tab} title={flavor.name} {index} let:folder let:folderContainer>
		{#if folderContainer}
			<Input
				parent={folder}
				paramsStore={writable({ name: flavor.name })}
				key={'name'}
				onChange={({ value: name }) =>
					dispatchUpdateFlavorNameActions(recipeState, flavor.uuid, name)}
			/>
			<Input
				parent={folder}
				paramsStore={writable({ type: flavor.type })}
				key={'type'}
				onChange={({ value: type }) =>
					dispatchUpdateFlavorTypeActions(recipeState, flavor.uuid, type)}
				inputParams={{ options: flavorTypes }}
				disabled={!allowChangeType}
			/>
			{#if allowDelete}
				<Button
					parent={folder}
					title={'delete'}
					onClick={() => dispatchDeleteFlavorActions(recipeState, flavor.uuid)}
				/>
			{/if}
			{@const flavorTerminals = terminals.filter(
				(terminal) => terminal.flavorUuid == flavor.uuid && terminal.direction != direction
			)}
			{#if flavorTerminals.length > 0}
				<TerminalRack
					parentElement={folderContainer}
					terminals={flavorTerminals}
					direction={oppositeDirection}
				/>
			{/if}
		{/if}
	</Folder>
{/each}
