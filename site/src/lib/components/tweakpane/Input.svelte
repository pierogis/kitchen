<script lang="ts">
	import { onMount } from 'svelte';
	import type { Writable } from 'svelte/store';

	import type { BladeApi, InputBindingController } from '@tweakpane/core';
	import type { FolderApi, InputParams } from 'tweakpane';

	import { FlavorType, type Payload } from '$lib/common/types';

	export let folder: FolderApi;

	export let payloadStore: Writable<Payload<FlavorType> | undefined>;
	export let key: string;
	export let options: InputParams | undefined = undefined;

	let inputElement: HTMLElement;

	onMount(() => {
		let payload = $payloadStore;
		let bladeApi: BladeApi<InputBindingController<any>>;

		let params = { [key]: payload?.params || '' };

		let fired = false;

		// this is so fucked
		payloadStore.subscribe((newPayload) => {
			if (fired) {
				if (newPayload?.type == payload?.type) {
					params = { [key]: newPayload?.params || '' };
				} else {
					// payload type has changed
				}
			}
			fired = true;
		});

		if (payload?.type == FlavorType.Color) {
			options = { ...options, view: 'color', color: { alpha: true } };
		}

		bladeApi = folder.addInput(params, key, options).on('change', (ev) => {
			if (payload) {
				$payloadStore = {
					type: payload.type,
					params: ev.value
				};
			}
		});

		const element = bladeApi.controller_.valueController.view.element.parentElement;
		if (element) {
			inputElement = element;
			inputElement.style.maxWidth = '8rem';
			inputElement.style.display = 'flex';
		}

		return () => {
			folder.remove(bladeApi);
		};
	});
</script>

<slot {inputElement} />
