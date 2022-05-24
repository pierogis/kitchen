<script lang="ts">
	import { type Writable, writable } from 'svelte/store';
	import { FlavorType, type Direction } from '@prisma/client';

	import type { Flavor } from '$lib/flavors';
	import { draggableAction } from '$lib/common/actions/draggableAction';

	import TerminalRack from '$lib/terminals/TerminalRack.svelte';

	import Pane from '$lib/components/tweakpane/Pane.svelte';
	import Folder from '$lib/components/tweakpane/Folder.svelte';

	import Input from './tweakpane/Input.svelte';
	import Monitor from './tweakpane/Monitor.svelte';
	import { colorOnChange } from '$lib/flavors/color';
	import { imageOnChange } from '$lib/flavors/image';
	import { numberOnChange } from '$lib/flavors/number';
	import { textOnChange } from '$lib/flavors/text';

	export let ingredientId: number;
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
	<Pane let:pane>
		{#if pane}
			{#each flavors as flavor}
				<Folder let:folder {pane} title={flavor.name}>
					{#if flavor.type == FlavorType.Color}
						<Input
							{folder}
							paramsStore={writable(flavor.parameters)}
							key="color"
							onChange={colorOnChange}
							let:inputElement
						>
							{#each flavor.directions as direction}
								<TerminalRack
									parentElement={inputElement}
									bind:container={terminalRackContainers[direction][flavor.name]}
									{ingredientId}
									flavorName={flavor.name}
									flavorType={flavor.type}
									{direction}
								/>
							{/each}
						</Input>
					{:else if flavor.type == FlavorType.Image}
						<Input
							{folder}
							paramsStore={writable(flavor.parameters)}
							key="image"
							onChange={imageOnChange}
							options={{
								extensions: '.jpg, .png, .gif, .mp4'
							}}
							let:inputElement
						>
							{#each flavor.directions as direction}
								<TerminalRack
									parentElement={inputElement}
									bind:container={terminalRackContainers[direction][flavor.name]}
									{ingredientId}
									flavorName={flavor.name}
									flavorType={flavor.type}
									{direction}
								/>
							{/each}
						</Input>
						<Monitor
							{folder}
							paramsStore={writable(flavor.parameters)}
							key="height"
							options={{
								disabled: true,
								format: (h) => h.toString()
							}}
							let:monitorElement
						>
							{#each flavor.directions as direction}
								<TerminalRack
									parentElement={monitorElement}
									bind:container={terminalRackContainers[direction][flavor.name]}
									{ingredientId}
									flavorName={flavor.name}
									flavorType={flavor.type}
									{direction}
								/>
							{/each}
						</Monitor>
						<Monitor
							{folder}
							paramsStore={writable(flavor.parameters)}
							key="width"
							options={{
								disabled: true,
								format: (h) => h.toString()
							}}
							let:monitorElement
						>
							{#each flavor.directions as direction}
								<TerminalRack
									parentElement={monitorElement}
									bind:container={terminalRackContainers[direction][flavor.name]}
									{ingredientId}
									flavorName={flavor.name}
									flavorType={flavor.type}
									{direction}
								/>
							{/each}
						</Monitor>
					{:else if flavor.type == FlavorType.Number}
						<Input
							{folder}
							paramsStore={writable(flavor.parameters)}
							key="number"
							onChange={numberOnChange}
							let:inputElement
						>
							{#each flavor.directions as direction}
								<TerminalRack
									parentElement={inputElement}
									bind:container={terminalRackContainers[direction][flavor.name]}
									{ingredientId}
									flavorName={flavor.name}
									flavorType={flavor.type}
									{direction}
								/>
							{/each}
						</Input>
					{:else if flavor.type == FlavorType.Text}
						<Input
							{folder}
							paramsStore={writable(flavor.parameters)}
							key="text"
							onChange={textOnChange}
							let:inputElement
						>
							{#each flavor.directions as direction}
								<TerminalRack
									parentElement={inputElement}
									bind:container={terminalRackContainers[direction][flavor.name]}
									{ingredientId}
									flavorName={flavor.name}
									flavorType={flavor.type}
									{direction}
								/>
							{/each}
						</Input>
					{/if}
				</Folder>
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
