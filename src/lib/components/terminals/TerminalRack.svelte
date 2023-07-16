<script lang="ts">
	import { checkNearAction } from '$lib/common/actions/checkNear';
	import { Direction } from '$types';

	import { type Terminal, terminalHeight } from '$view';

	import TerminalComponent from './Terminal.svelte';

	export let direction: Direction;

	let near = false;

	export let terminals: Terminal[];

	const nearTerminalRackDistance = 12;
	const rackHeight = 20;

	const paneOffset = 6;

	let usingNovelTerminal = false;

	$: expanded = near || usingNovelTerminal;

	// if expanded, take a width dependent on the number of terminals
	// 1 more terminal than there are connections
	$: rackWidth = !expanded
		? 4
		: ((rackHeight - terminalHeight) / 2) * (terminals.length + 1) +
		  terminalHeight * terminals.length;

	export let parentElement: HTMLElement;

	function action(element: HTMLElement) {
		if (direction == Direction.In) {
			parentElement.prepend(element);
		} else if (direction == Direction.Out) {
			parentElement.append(element);
		}
	}
</script>

<div
	use:action
	class="terminal-rack"
	class:out={direction == Direction.Out}
	class:in={direction == Direction.In}
	style:--rack-width={rackWidth + 'px'}
	style:--rack-height={rackHeight + 'px'}
	style:--pane-offset={paneOffset + 'px'}
	use:checkNearAction={nearTerminalRackDistance}
	on:near={(event) => {
		near = event.detail;
	}}
>
	<div
		class="terminals-container"
		class:expanded
		style:--rack-width={rackWidth + 'px'}
		style:--rack-height={rackHeight + 'px'}
		style:--pane-offset={paneOffset + 'px'}
	>
		{#each terminals as terminal (terminal.connectionUuid)}
			<TerminalComponent {terminal} {expanded} {terminalHeight} />
		{/each}
	</div>
</div>

<style>
	.terminal-rack {
		display: flex;
		align-items: center;

		border-radius: 6px 6px 6px 6px;
		background-color: var(--primary-color);
		box-shadow: 0 2px 4px var(--shadow-color);

		position: relative;
		width: var(--rack-width);
		height: var(--rack-height);
		transition: width 100ms, margin 100ms, left 100ms, right 100ms;
	}

	.terminal-rack:hover {
		transition: all 0s;
	}

	.terminals-container {
		display: flex;
		align-items: center;
		justify-content: space-evenly;

		width: 10px;
		transition: width 100ms;
	}

	.terminals-container.expanded {
		width: var(--rack-width);
		transition: width 0ms;
	}

	.in {
		flex-direction: row-reverse;
		right: calc(var(--rack-width) + var(--pane-offset));
		margin-right: calc(0px - var(--rack-width));
	}

	.out {
		left: calc(var(--rack-width) + var(--pane-offset));
		margin-left: calc(0px - var(--rack-width));
	}
</style>
