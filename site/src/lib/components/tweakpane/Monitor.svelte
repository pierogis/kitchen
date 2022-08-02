<script lang="ts">
	import { onMount } from 'svelte';
	import type { Readable } from 'svelte/store';

	import type { FolderApi, MonitorParams } from 'tweakpane';
	import type { MonitorBindingApi } from '@tweakpane/core';

	import type { CanvasValue } from '$lib/common/plugins/canvas/view';

	// generic for the bound value type of this monitor
	type T = $$Generic<string | number | CanvasValue>;

	export let folder: FolderApi;
	export let paramsStore: Readable<{ [key: string]: T }>;
	export let key: string;
	export let monitorParams: MonitorParams | undefined = undefined;
	export let index: number | undefined = undefined;
	export let interval: number | undefined = undefined;

	let monitorElement: HTMLElement;

	onMount(() => {
		let monitorApi: MonitorBindingApi<T>;

		let params = $paramsStore;
		monitorApi = folder.addMonitor(params, key, { ...monitorParams, index, interval });

		// const element = monitorApi.controller_.valueController.view.element.parentElement;
		const element = monitorApi.element;
		if (element) {
			monitorElement = element;
			// monitorElement.style.maxWidth = '9rem';
			// monitorElement.style.display = 'flex';
		}

		// this is so fucked
		let fired = false;
		paramsStore.subscribe((newParams) => {
			if (fired) {
				if (newParams[key] != params[key]) {
					params[key] = newParams[key];
				}
			}
			fired = true;
		});

		return () => {
			folder.remove(monitorApi);
		};
	});
</script>

<slot {monitorElement} />
