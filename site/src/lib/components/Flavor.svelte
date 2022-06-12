<script lang="ts">
	import { writable, type Readable, type Writable, derived, type Unsubscriber } from 'svelte/store';

	import Input from './tweakpane/Input.svelte';
	import type { FolderApi, TpChangeEvent } from 'tweakpane';
	import TerminalRack from '$lib/terminals/TerminalRack.svelte';

	import type { Flavor, FlavorType } from '$lib/flavors';
	import { colorOnChange, type ColorParams } from '$lib/flavors/color';
	import { imageOnChange } from '$lib/flavors/image';
	import { numberOnChange } from '$lib/flavors/number';
	import { textOnChange } from '$lib/flavors/text';

	export let flavor: Flavor;

	import type { Cable } from '$lib/connections/cable';
	import Monitor from './tweakpane/Monitor.svelte';
	import { Direction } from '$lib/common/types';

	export let inCable: Cable | undefined = undefined;
	export let outCables: Readable<Cable[]>;

	export let folder: FolderApi;
	export let ingredientUuid: string;

	const typeDescriptors: {
		[type in FlavorType]: {
			key: string;
			onChange: (paramsStore: Writable<any>, ev: TpChangeEvent<any>) => void;
		};
	} = {
		Number: {
			key: 'number',
			onChange: numberOnChange
		},
		Color: {
			key: 'color',
			onChange: colorOnChange
		},
		Text: {
			key: 'text',
			onChange: textOnChange
		},
		Image: {
			key: 'image',
			onChange: imageOnChange
		}
	};

	let paramsStore = writable(flavor.parameters);
	let unsub: Unsubscriber;
	unsub = inCable.payload.subscribe((newInPayload) => {
		paramsStore.set(newInPayload);
	});

	inCable.subscribe((newInCable) => {
		unsub();
	});

	paramsStore.subscribe((newParams) => {
		$outCables.map((outCable) => outCable.payload.set(newParams));
	});

	const key = typeDescriptors[flavor.type].key;
	const onChange = typeDescriptors[flavor.type].onChange;
</script>

{#if $inCable}
	<Monitor {folder} paramsStore={$inCable.payload} {key} let:monitorElement>
		{#each flavor.directions as direction}
			<TerminalRack
				parentElement={monitorElement}
				cables={direction == Direction.In ? derived(inCable, (c) => [c]) : outCables}
				{ingredientUuid}
				flavorUuid={flavor.uuid}
				flavorName={flavor.name}
				flavorType={flavor.type}
				showNovelTerminal={direction == Direction.In && $inCable != null}
				{direction}
			/>
		{/each}
	</Monitor>
{:else}
	<Input {folder} {paramsStore} {key} {onChange} let:inputElement>
		{#each flavor.directions as direction}
			<TerminalRack
				parentElement={inputElement}
				cables={direction == Direction.In ? derived(inCable, (c) => [c]) : outCables}
				{ingredientUuid}
				flavorUuid={flavor.uuid}
				flavorName={flavor.name}
				flavorType={flavor.type}
				showNovelTerminal={direction == Direction.In && $inCable != null}
				{direction}
			/>
		{/each}
	</Input>
{/if}
<!-- {:else if flavor.type == FlavorType.Image}
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
				{ingredientUuid}
				flavorName={flavor.name}
				flavorType={flavor.type}
				{direction}
			/>
		{/each}
	</Input>
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
				{ingredientUuid}
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
				{ingredientUuid}
				flavorName={flavor.name}
				flavorType={flavor.type}
				{direction}
			/>
		{/each}
	</Input>
{/if} -->
