<script lang="ts">
	import { onMount } from 'svelte';
	import type { Writable } from 'svelte/store';

	import type { FlavorType, Payload } from '$lib/common/types';

	import type { FolderApi, MonitorParams } from 'tweakpane';
	import type { BladeApi, MonitorBindingController } from '@tweakpane/core';

	export let folder: FolderApi;

	export let payloadStore: Writable<Payload<FlavorType>>;
	export let key: string;
	export let options: MonitorParams | undefined = undefined;

	let monitorElement: HTMLElement;

	onMount(async () => {
		let payload = $payloadStore;
		let bladeApi: BladeApi<MonitorBindingController<any>>;

		let params = { [key]: payload?.params };

		let fired = false;

		// this is so fucked
		payloadStore.subscribe((newPayload) => {
			if (fired) {
				if (newPayload?.type == payload.type) {
					params = { [key]: newPayload.params };
				} else {
					// payload type has changed
				}
			}
			fired = true;
		});

		bladeApi = folder.addMonitor(params, key, options);

		const element = bladeApi.controller_.valueController.view.element.parentElement;
		if (element) {
			monitorElement = element;
			monitorElement.style.maxWidth = '6rem';
			monitorElement.style.display = 'flex';
		}

		return () => {
			folder.remove(bladeApi);
		};
	});
</script>

<slot {monitorElement} />
