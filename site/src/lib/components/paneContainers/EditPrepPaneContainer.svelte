<script lang="ts">
	import { writable } from 'svelte/store';

	import type { TpChangeEvent } from 'tweakpane';

	import { type Prep, PrepType, Direction } from '@types';
	import type { Terminal } from '@view';

	import { Pane, Input } from '@components/tweakpane';
	import { TerminalRack } from '@components/terminals';
	import { PaneContainer } from '.';

	export let prep: Prep<PrepType>;
	export let terminals: Terminal[];
	export let direction: Direction;

	function handleNameUpdate() {}
	function handleTypeUpdate(event: TpChangeEvent<PrepType>) {
		const prep = {
			type: event.value
		};

		// dispatch UpdatePrep action
	}

	const prepTypes: { [name: string]: PrepType } = {
		add: PrepType.Add,
		image: PrepType.Image,
		material: PrepType.Material,
		mesh: PrepType.Mesh,
		plate: PrepType.Plate,
		shader: PrepType.Shader,
		sphere: PrepType.Sphere,
		texture: PrepType.Texture
	};

	$: inTerminals = terminals.filter((terminal) => terminal.direction == Direction.In);
	$: outTerminals = terminals.filter((terminal) => terminal.direction == Direction.Out);

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
		onChange={(event) => console.log(event.value)}
	/>
	<Input
		folder={pane}
		paramsStore={writable({ type: prep.type })}
		key={'type'}
		inputParams={{ options: prepTypes }}
		onChange={(event) => handleTypeUpdate(event)}
	/>
	{#if inTerminals.length > 0 && direction != Direction.In}
		<TerminalRack parentElement={paneContainer} terminals={inTerminals} direction={Direction.In} />
	{/if}
	{#if outTerminals.length > 0 && direction != Direction.Out}
		<TerminalRack
			parentElement={paneContainer}
			terminals={outTerminals}
			direction={Direction.Out}
		/>
	{/if}
</PaneContainer>
