<script lang="ts">
	import { onMount } from 'svelte';
	import type { Writable } from 'svelte/store';

	import type { BladeApi, InputBindingController } from '@tweakpane/core';
	import type { FolderApi, InputParams } from 'tweakpane';

	import { FlavorType, type Payload } from '$lib/common/types';

	export let folder: FolderApi;

	export let payloadStore: Writable<Payload<FlavorType>>;
	export let key: string;
	export let options: InputParams | undefined = undefined;

	let inputElement: HTMLElement;

	onMount(() => {
		let payload = $payloadStore;
		let bladeApi: BladeApi<InputBindingController<any>>;

		if (payload.type == FlavorType.Color) {
			let params = { [key]: payload.Color };

			let fired = false;

			// this is so fucked
			payloadStore.subscribe((newPayload) => {
				if (fired) {
					if (newPayload.type == FlavorType.Color) {
						params = { [key]: newPayload.Color };
					} else {
						// payload type has changed
					}
				}
				fired = true;
			});

			bladeApi = folder.addInput(params, key, options).on('change', (ev) => {
				$payloadStore = { type: FlavorType.Color, Color: ev.value };
			});
		} else if (payload.type == FlavorType.Image) {
			let params = { [key]: payload.Image };

			let fired = false;

			// this is so fucked
			payloadStore.subscribe((newPayload) => {
				if (fired) {
					if (newPayload.type == FlavorType.Image) {
						params = { [key]: newPayload.Image };
					} else {
						// payload type has changed
					}
				}
				fired = true;
			});

			bladeApi = folder.addInput(params, key, options).on('change', (ev) => {
				$payloadStore = { type: FlavorType.Image, Image: ev.value };
			});
		} else if (payload.type == FlavorType.Number) {
			let params = { [key]: payload.Number };

			let fired = false;

			// this is so fucked
			payloadStore.subscribe((newPayload) => {
				if (fired) {
					if (newPayload.type == FlavorType.Number) {
						params = { [key]: newPayload.Number };
					} else {
						// payload type has changed
					}
				}
				fired = true;
			});

			bladeApi = folder.addInput(params, key, options).on('change', (ev) => {
				$payloadStore = { type: FlavorType.Number, Number: ev.value };
			});
		} else {
			let params = { [key]: payload.Text };

			let fired = false;

			// this is so fucked
			payloadStore.subscribe((newPayload) => {
				if (fired) {
					if (newPayload.type == FlavorType.Text) {
						params = { [key]: newPayload.Text };
					} else {
						// payload type has changed
					}
				}
				fired = true;
			});
			bladeApi = folder.addInput(params, key, options).on('change', (ev) => {
				$payloadStore = { type: FlavorType.Text, Text: ev.value };
			});
		}

		const element = bladeApi.controller_.valueController.view.element.parentElement;
		if (element) {
			inputElement = element;
			inputElement.style.width = '4rem';
			inputElement.style.display = 'flex';
		}

		return () => {
			folder.remove(bladeApi);
		};
	});
</script>

<slot {inputElement} />
