<script lang="ts">
	import { Direction } from '@types';
	import type { Terminal } from '@view';

	import { Pane } from '@pierogis/svelte-tweakpane';

	import { TerminalRack } from '@components/terminals';
	import { ThreePlugin, GrouplistPlugin } from '$lib/common/plugins';

	export let title: string | undefined = undefined;
	export let terminals: Terminal[];
	export let direction: Direction | undefined = undefined;

	let paneContainer: HTMLElement;

	let folded = false;
	function handleFold() {
		folded = !folded;
	}

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
		<Pane
			{title}
			container={paneContainer}
			let:pane
			on:fold={handleFold}
			plugins={[GrouplistPlugin, ThreePlugin]}
		>
			{#if !folded}
				<slot {pane} {paneContainer} />
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
		place-items: center;
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
