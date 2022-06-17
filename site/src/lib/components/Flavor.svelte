<script lang="ts">
	import { get, writable, type Readable, type Writable } from 'svelte/store';

	import type { FolderApi } from 'tweakpane';

	import { type Payload, type Flavor, FlavorType, Direction } from '$lib/common/types';

	import type { Cable, Terminal } from '$lib/state/stores/view';

	import Monitor from './tweakpane/Monitor.svelte';
	import Input from './tweakpane/Input.svelte';
	import TerminalRack from '$lib/components/TerminalRack.svelte';

	export let flavor: Flavor;
	export let cables: Readable<Cable[]>;
	export let terminals: Readable<Terminal[]>;

	$: inTerminals = $terminals.filter((terminal) => terminal.direction == Direction.In);
	$: outTerminals = $terminals.filter((terminal) => terminal.direction == Direction.Out);

	let inCable = $cables.find((cable) => cable.inFlavorUuid == flavor.uuid);
	let outCables = $cables.filter((cable) => cable.outFlavorUuid == flavor.uuid);

	export let folder: FolderApi;

	let initialPayload = inCable ? get(inCable.payload) : undefined;

	if (!initialPayload || !initialPayload.params) {
		switch (flavor.type) {
			case FlavorType.Color:
				initialPayload = { type: FlavorType.Color, params: '#0088ff' };
				break;
			case FlavorType.Image:
				initialPayload = { type: FlavorType.Image, params: '' };
				break;
			case FlavorType.Number:
				initialPayload = { type: FlavorType.Number, params: 0 };
				break;
			case FlavorType.Text:
				initialPayload = { type: FlavorType.Text, params: '' };
				break;
		}
	}

	// need an intermediary store that recieves changes from ui
	const payloadStore: Writable<Payload<FlavorType>> = writable(initialPayload);

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

{#if inCable && $payloadStore}
	<Monitor {folder} {payloadStore} key={flavor.name} let:monitorElement>
		{#each flavor.directions as direction (direction)}
			<TerminalRack
				parentElement={monitorElement}
				terminals={direction == Direction.In ? inTerminals : outTerminals}
				{direction}
			/>
		{/each}
	</Monitor>
{:else}
	<Input {folder} {payloadStore} key={flavor.name} let:inputElement>
		{#each flavor.directions as direction (direction)}
			<TerminalRack
				parentElement={inputElement}
				terminals={direction == Direction.In ? inTerminals : outTerminals}
				{direction}
			/>
		{/each}
	</Input>
{/if}
