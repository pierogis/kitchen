<script lang="ts">
	import { onMount } from 'svelte';
	import type { Readable } from 'svelte/store';

	import type { FolderApi, MonitorParams } from 'tweakpane';
	import type { BladeApi, MonitorBindingController } from '@tweakpane/core';

	import type { FlavorType, Payload } from '@types';

	export let folder: FolderApi;
	export let payloadStore: Readable<Payload<FlavorType>>;
	export let key: string;
	export let options: MonitorParams | undefined = undefined;
	export let index: number | undefined = undefined;

	let monitorElement: HTMLElement;

	onMount(() => {
		let payload = $payloadStore;
		let bladeApi: BladeApi<MonitorBindingController<any>>;

		let params = { [key]: payload?.params };

		let fired = false;

		// this is so fucked
		payloadStore.subscribe((newPayload) => {
			if (fired) {
				if (newPayload?.type == payload.type) {
					params[key] = newPayload.params;
				} else {
					// payload type has changed
				}
			}
			fired = true;
		});

		bladeApi = folder.addMonitor(params, key, { ...options, index });

		const element = bladeApi.controller_.valueController.view.element.parentElement;
		if (element) {
			monitorElement = element;
			monitorElement.style.maxWidth = '9rem';
			monitorElement.style.display = 'flex';
		}

		return () => {
			folder.remove(bladeApi);
		};
	});
</script>

<slot {monitorElement} />
