<script lang="ts">
	import { createEventDispatcher, getContext, onMount } from 'svelte';

	import { type Flavor, Direction } from '@types';
	import { viewStateContextKey, type Terminal, type ViewState } from '@view';

	import TerminalRack from './TerminalRack.svelte';
	import FlavorComponent from './Flavor.svelte';

	import Pane from './tweakpane/Pane.svelte';

	export let name: string;
	export let flavors: Flavor[];
	export let terminals: Terminal[];
	export let usageUuid: string;
	export let direction: Direction | undefined = undefined;

	let paneContainer: HTMLElement;

	let viewState: ViewState = getContext(viewStateContextKey);
	const fillings = viewState.fillings;

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
							direction && !flavor.prepUuid
								? direction
								: flavor.directions.includes(Direction.Out)
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
			{#if inTerminals.length > 0 && direction != Direction.In}
				<TerminalRack
					parentElement={paneContainer}
					terminals={inTerminals}
					direction={Direction.In}
				/>
			{/if}
			{#if outTerminals.length > 0 && direction != Direction.Out}
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

	:global(.pane-container > div) {
		transition: margin-left 0.5s, margin-right 0.5s;
	}

	:global(.pane-container.expanded.in > div) {
		margin-left: 8px;
	}

	:global(.pane-container.expanded.out > div) {
		margin-right: 8px;
	}
</style>
