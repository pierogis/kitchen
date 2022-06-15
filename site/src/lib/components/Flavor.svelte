<script lang="ts">
	import { derived, get, writable, type Readable, type Writable } from 'svelte/store';

	import type { FolderApi, TpChangeEvent } from 'tweakpane';

	import { type Payload, type Flavor, FlavorType, Direction } from '$lib/common/types';

	import type { Cable } from '$lib/state/stores/view/cables';
	import type { Terminal } from '$lib/state/stores/view/terminals';

	import Monitor from './tweakpane/Monitor.svelte';
	import Input from './tweakpane/Input.svelte';
	import TerminalRack from '$lib/components/TerminalRack.svelte';

	export let flavor: Flavor;
	export let inCable: Cable | undefined = undefined;
	export let outCables: Cable[];
	export let terminals: Terminal[];

	let inTerminals: Terminal[] = [];
	let outTerminals: Terminal[] = [];
	$: {
		inTerminals = [];
		outTerminals = [];
		terminals.forEach((terminal) =>
			terminal.direction == Direction.In ? inTerminals.push(terminal) : outTerminals.push(terminal)
		);
	}

	export let folder: FolderApi;

	let initialParams: Payload<FlavorType>;
	if (inCable) {
		initialParams = get(inCable.payload);
	} else {
		switch (flavor.type) {
			case FlavorType.Color:
				initialParams = { type: FlavorType.Color, Color: { r: 0, g: 0, b: 0 } };
				break;
			case FlavorType.Image:
				initialParams = { type: FlavorType.Image, Image: '' };
				break;
			case FlavorType.Number:
				initialParams = { type: FlavorType.Number, Number: 0 };
				break;
			case FlavorType.Text:
				initialParams = { type: FlavorType.Text, Text: '' };
				break;
		}
	}

	// need an intermediary store that recieves changes from ui
	const payloadStore: Writable<Payload<FlavorType>> = writable(initialParams);

	// update ui paramsStore with new inCable payloads
	inCable?.payload.subscribe((newPayload) => {
		payloadStore.update((currentPayload) => {
			currentPayload = newPayload;
			return currentPayload;
		});
	});

	// update outCables' payloads with new params (from Monitor/Input)
	payloadStore.subscribe((newPayload) => {
		outCables.forEach((cable) => {
			cable.payload.update((currentPayload) => {
				currentPayload = newPayload;
				return currentPayload;
			});
		});
	});
</script>

{#if inCable}
	<Monitor {folder} {payloadStore} key={flavor.name} let:monitorElement>
		{#each flavor.directions as direction (direction)}
			<TerminalRack
				parentElement={monitorElement}
				terminals={direction == Direction.In ? inTerminals : outTerminals}
				flavorUuid={flavor.uuid}
				flavorName={flavor.name}
				flavorType={flavor.type}
				{direction}
			/>
		{/each}
	</Monitor>
{:else}
	<Input {folder} {payloadStore} key={flavor.name} let:inputElement>
		{#each flavor.directions as direction}
			<TerminalRack
				parentElement={inputElement}
				terminals={direction == Direction.In ? inTerminals : outTerminals}
				flavorUuid={flavor.uuid}
				flavorName={flavor.name}
				flavorType={flavor.type}
				{direction}
			/>
		{/each}
	</Input>
{/if}
