<script lang="ts">
	import { writable, type Writable } from 'svelte/store';
	import { Pane } from 'tweakpane';

	import { flavorAttaches, type Flavor } from '$lib/flavors';
	import { draggableAction } from '../common/actions/draggableAction';
	import { Direction } from '$lib/common/types';

	import TerminalRack from '$lib/terminals/TerminalRack.svelte';

	export let ingredientId: number;
	export let flavors: Flavor[];
	export let coords: { x: number; y: number };

	// these will bind to the terminal racks inside
	let terminalRackContainers: {
		in: { [flavorName: string]: HTMLElement };
		out: { [flavorName: string]: HTMLElement };
	} = { in: {}, out: {} };

	// delete node on close button
	function handleRemove(event: MouseEvent) {}

	let grabTarget: HTMLElement;
	let dragging = false;

	function centerOnInitialLocationAction(element: HTMLElement) {
		const midpoint = element.getBoundingClientRect().width / 2;
		element.style.left = coords.x - midpoint + 'px';
	}

	function attachAction(element: HTMLElement) {
		const pane = new Pane({ container: element });

		flavors.forEach((flavor) => {
			flavorAttaches[flavor.type](pane, writable(flavor.parameters));
		});
	}

	const nodeHeaderSize = 12;
</script>

<div
	class="node no-select"
	style="top: {coords.y - nodeHeaderSize / 2}px;"
	use:centerOnInitialLocationAction
	use:draggableAction={grabTarget}
	style:--node-header-size="{nodeHeaderSize}px"
>
	<div class="header">
		<div class="grab" bind:this={grabTarget} class:dragging>
			<div class="grab-dot" />
			<div class="grab-dot" />
		</div>

		<div class="remove" on:click={handleRemove} />
	</div>
	<div use:attachAction />
</div>

{#each flavors as flavor}
	{#each flavor.directions as direction}
		<TerminalRack
			bind:container={terminalRackContainers.in[flavor.name]}
			{ingredientId}
			flavorName={flavor.name}
			flavorType={flavor.type}
			{direction}
		/>
	{/each}
{/each}

<style>
	.no-select {
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
	}
	.node {
		position: absolute;
		z-index: 1;
		display: block;
	}
	.header {
		display: flex;
		height: var(--node-header-size);
		margin-bottom: 4px;
	}

	.grab {
		background-color: var(--primary-color);

		box-shadow: 0 2px 4px var(--shadow-color);

		border-radius: 6px 0px 0px 6px;

		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;

		cursor: grab;
	}
	.grab:hover {
		filter: brightness(90%) saturate(150%);
	}

	.grab-dot {
		background-color: var(--button-color-hover);
		border-radius: 50%;
		height: 4px;
		width: 4px;
		margin: 2px;
	}

	.remove {
		background-color: var(--remove-color);
		box-shadow: 0 2px 4px var(--primary-color-shadow);

		border-radius: 0px 6px 6px 0px;

		width: var(--node-header-size);
		margin-left: 5px;
	}

	.remove:hover {
		filter: brightness(90%) saturate(150%);
		cursor: pointer;
	}
</style>
