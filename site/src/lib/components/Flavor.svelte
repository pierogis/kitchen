<script lang="ts">
	import { writable, type Writable } from 'svelte/store';

	import type { FolderApi, TpChangeEvent } from 'tweakpane';
	import type { Bindable } from '@tweakpane/core';

	import { type Flavor, FlavorType, Direction } from '$lib/common/types';

	import type { Cable } from '$lib/connections/cable';
	import Monitor from './tweakpane/Monitor.svelte';
	import Input from './tweakpane/Input.svelte';
	import TerminalRack from '$lib/terminals/TerminalRack.svelte';

	export let flavor: Flavor;
	export let inCable: Cable | undefined = undefined;
	export let outCables: Cable[];
	export let folder: FolderApi;
	export let ingredientUuid: string;

	const typeDescriptors: {
		[type in FlavorType]: {
			key: string;
			eventToBindable: (ev: TpChangeEvent<any>) => Bindable;
		};
	} = {
		Number: {
			key: 'number',
			eventToBindable: (ev: TpChangeEvent<number>) => {
				return {
					number: ev.value
				};
			}
		},
		Color: {
			key: 'color',
			eventToBindable: (ev: TpChangeEvent<{ r: number; g: number; b: number }>) => {
				return {
					color: {
						r: ev.value.r,
						g: ev.value.g,
						b: ev.value.b
					}
				};
			}
		},
		Text: {
			key: 'text',
			eventToBindable: (ev: TpChangeEvent<string>) => {
				return { text: ev.value };
			}
		},
		Image: {
			key: 'text',
			eventToBindable: (ev: TpChangeEvent<string>) => {
				return { text: ev.value };
			}
		}
	};
	const key = typeDescriptors[flavor.type].key;
	const eventToBindable = typeDescriptors[flavor.type].eventToBindable;

	let initialParams: Bindable;
	switch (flavor.type) {
		case FlavorType.Color:
			initialParams = { color: { r: 0, g: 0, b: 0 } };
			break;
		case FlavorType.Image:
			initialParams = { text: '' };

			break;
		case FlavorType.Number:
			initialParams = { number: 0 };
			break;
		case FlavorType.Text:
			initialParams = { text: '' };
			break;
	}

	// need an intermediary store that recieves changes from ui
	const paramsStore: Writable<Bindable> = writable(initialParams);

	// update ui paramsStore with new inCable payloads
	inCable?.payload.subscribe((newPayload) => {
		paramsStore.update((currentParams) => {
			currentParams[key] = newPayload;
			return currentParams;
		});
	});

	// update outCables' payloads with new params (from Monitor/Input)
	paramsStore.subscribe((newParams) => {
		outCables.forEach((cable) => {
			cable.payload.update((currentPayload) => {
				currentPayload = newParams[key];
				return currentPayload;
			});
		});
	});
</script>

{#if inCable}
	<Monitor {folder} {paramsStore} {key} let:monitorElement>
		{#each flavor.directions as direction}
			<TerminalRack
				parentElement={monitorElement}
				cables={direction == Direction.In ? [inCable] : outCables}
				{ingredientUuid}
				flavorUuid={flavor.uuid}
				flavorName={flavor.name}
				flavorType={flavor.type}
				showNovelTerminal={direction == Direction.In && inCable != null}
				{direction}
			/>
		{/each}
	</Monitor>
{:else}
	<Input
		{folder}
		{paramsStore}
		{key}
		onChange={(store, ev) => store.set(eventToBindable(ev))}
		let:inputElement
	>
		{#each flavor.directions as direction}
			<TerminalRack
				parentElement={inputElement}
				cables={direction == Direction.In ? [] : outCables}
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
