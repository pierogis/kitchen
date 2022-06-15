<script lang="ts">
	import { onMount } from 'svelte';
	import type { Writable } from 'svelte/store';

	import { FlavorType, type Payload } from '$lib/common/types';

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

			bladeApi = folder.addMonitor(params, key, options);
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

			bladeApi = folder.addMonitor(params, key, options);
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

			bladeApi = folder.addMonitor(params, key, options);
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

			bladeApi = folder.addMonitor(params, key, options);
		}

		const element = bladeApi.controller_.valueController.view.element.parentElement;
		if (element) {
			monitorElement = element;
			monitorElement.style.width = '4rem';
			monitorElement.style.display = 'flex';
		}

		return () => {
			folder.remove(bladeApi);
		};
	});
</script>

<slot {monitorElement} />
