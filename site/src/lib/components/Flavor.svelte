<script lang="ts">
	import { writable } from 'svelte/store';

	import { FlavorType } from '@prisma/client';

	import Input from './tweakpane/Input.svelte';
	import Monitor from './tweakpane/Monitor.svelte';
	import type { FolderApi } from 'tweakpane';
	import TerminalRack from '$lib/terminals/TerminalRack.svelte';

	import type { Flavor } from '$lib/flavors';
	import { colorOnChange } from '$lib/flavors/color';
	import { imageOnChange } from '$lib/flavors/image';
	import { numberOnChange } from '$lib/flavors/number';
	import { textOnChange } from '$lib/flavors/text';

	export let terminalRackContainers;

	export let flavor: Flavor;

	export let folder: FolderApi;
	export let ingredientId: number;
</script>

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
