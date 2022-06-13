<script lang="ts">
	import { draggableAction } from '$lib/common/actions/draggableAction';
	import type { Direction, Flavor } from '$lib/common/types';
	import { cables } from '$lib/connections/cable';

	import Pane from '$lib/components/tweakpane/Pane.svelte';
	import FlavorComponent from './Flavor.svelte';

	export let ingredientUuid: string;
	export let name: string;
	export let flavors: Flavor[];
	export let coords: { x: number; y: number };

	// these will bind to the terminal racks inside
	let terminalRackContainers: {
		[direction in Direction]: { [flavorName: string]: HTMLElement };
	} = { In: {}, Out: {} };

	let grabTarget: HTMLElement;
	let dragging = false;

	function centerOnInitialLocationAction(element: HTMLElement) {
		const midpoint = element.getBoundingClientRect().width / 2;
		element.style.left = coords.x - midpoint + 'px';
	}

	// delete node on close button
	function handleRemove(event: MouseEvent) {}

	const nodeHeaderSize = 12;
</script>

<div
	class="node no-select"
	style="top: {coords.y - nodeHeaderSize / 2}px; --node-header-size: {nodeHeaderSize}px"
	use:centerOnInitialLocationAction
	use:draggableAction={grabTarget}
>
	<div class="header">
		<div class="grab" bind:this={grabTarget} class:dragging>
			<div class="grab-dot" />
			<div class="grab-dot" />
		</div>

		<div class="remove" on:click={handleRemove} />
	</div>
	<Pane let:pane title={name}>
		{#if pane}
			{#each flavors as flavor}
				<FlavorComponent
					inCable={$cables.find((cable) => cable.inFlavorUuid == flavor.uuid)}
					outCables={$cables.filter((cable) => cable.outFlavorUuid == flavor.uuid)}
					{flavor}
					folder={pane}
					{ingredientUuid}
				/>
			{/each}
		{/if}
	</Pane>
</div>

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
