<script lang="ts">
	import { onMount } from 'svelte';

	import type { FolderApi, MonitorParams } from 'tweakpane';
	import type { MonitorBindingApi } from '@tweakpane/core';
	import type { Readable } from 'svelte/store';

	export let folder: FolderApi;
	export let paramsStore: Readable<{ [key: string]: string | number }>;
	export let key: string;
	export let options: MonitorParams | undefined = undefined;
	export let index: number | undefined = undefined;

	let monitorElement: HTMLElement;

	onMount(() => {
		let monitorApi: MonitorBindingApi<string | number>;

		let params = $paramsStore;
		monitorApi = folder.addMonitor(params, key, { ...options, index });

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
