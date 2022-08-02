<script lang="ts">
	import { writable } from 'svelte/store';

	import type { TpChangeEvent } from 'tweakpane';

	import { type Flavor, Direction, FlavorType } from '@types';
	import type { Terminal } from '@view';

	import { Input, Folder } from '@components/tweakpane';
	import { TerminalRack } from '@components/terminals';
	import PaneContainer from './PaneContainer.svelte';

	export let flavors: Flavor[];
	export let terminals: Terminal[];
	export let direction: Direction;

	function handleNameUpdate() {}
	function handleFlavorTypeUpdate(event: TpChangeEvent<FlavorType>) {
		const prep = {
			type: event.value
		};

		// dispatch UpdatePrep action
	}

	const flavorTypes: { [name: string]: FlavorType } = {
		color: FlavorType.Color,
		geometry: FlavorType.Geometry,
		image: FlavorType.Image,
		material: FlavorType.Material,
		number: FlavorType.Number,
		object: FlavorType.Object,
		shader: FlavorType.Shader,
		text: FlavorType.Text,
		texture: FlavorType.Texture
	};

	$: inTerminals = terminals.filter((terminal) => terminal.direction == Direction.In);
	$: outTerminals = terminals.filter((terminal) => terminal.direction == Direction.Out);
</script>

<PaneContainer title={'flavors'} {terminals} {direction} let:pane>
	{#each flavors as flavor}
		<Folder {pane} title={flavor.name} let:folder let:folderContainer>
			{#if folderContainer}
				<Input
					{folder}
					paramsStore={writable({ name: flavor.name })}
					key={'name'}
					onChange={(event) => console.log(event.value)}
				/>
				<Input
					{folder}
					paramsStore={writable({ type: flavor.type })}
					key={'type'}
					onChange={(event) => console.log(event.value)}
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
