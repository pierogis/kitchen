<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';

	import { type Flavor, Direction } from '@types';
	import type { Terminal } from '$lib/state/stores/view';
	import type { FillingsState } from '$lib/state/stores/view/fillings';

	import TerminalRack from './TerminalRack.svelte';
	import FlavorComponent from './Flavor.svelte';

	import Pane from './tweakpane/Pane.svelte';

	export let name: string;
	export let flavors: Flavor[];
	export let terminals: Terminal[];
	export let usageUuid: string;
	export let fillings: FillingsState;
	export let direction: Direction | undefined = undefined;

	let paneContainer: HTMLElement;

	let folded = false;
	function handleFold() {
		folded = !folded;
	}

	const dispatch = createEventDispatcher();
	onMount(() => {
		dispatch('paneContainer', paneContainer);
	});

	$: inTerminals = terminals.filter((terminal) => terminal.direction == Direction.In);
	$: outTerminals = terminals.filter((terminal) => terminal.direction == Direction.Out);
</script>

<div
	bind:this={paneContainer}
	class:in={direction == Direction.In}
	class:out={direction == Direction.Out}
	class="pane-container no-select"
>
	{#if paneContainer}
		<Pane title={name} container={paneContainer} let:pane on:fold={handleFold}>
			{#if !folded}
				{#each flavors as flavor, index (flavor.uuid)}
					<FlavorComponent
						{index}
						{flavor}
						filling={fillings.getFilling(
							flavor.uuid,
							usageUuid,
							flavor.prepUuid && flavor.directions.includes(Direction.Out)
								? Direction.Out
								: Direction.In
						)}
						terminals={terminals.filter(
							(terminal) => terminal.flavorUuid == flavor.uuid && terminal.direction != direction
						)}
						{usageUuid}
						folder={pane}
					/>
				{/each}
			{/if}
		</Pane>
		{#if folded}
			<!-- need terminals if hidden -->
			{#if inTerminals.length > 0}
				<TerminalRack
					parentElement={paneContainer}
					terminals={inTerminals}
					direction={Direction.In}
				/>
			{/if}
			{#if outTerminals.length > 0}
				<TerminalRack
					parentElement={paneContainer}
					terminals={outTerminals}
					direction={Direction.Out}
				/>
			{/if}
		{/if}
	{/if}
</div>

<style>
	.pane-container {
		display: flex;
		align-items: center;
	}
</style>
