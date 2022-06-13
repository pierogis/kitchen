<script lang="ts">
	import type { Bindable } from '@tweakpane/core';

	import { onMount, tick } from 'svelte';

	import { get, type Writable } from 'svelte/store';

	import type { FolderApi, MonitorParams } from 'tweakpane';

	export let folder: FolderApi;

	export let paramsStore: Writable<Bindable>;
	export let key: string;
	export let options: MonitorParams | undefined = undefined;

	let params = get(paramsStore);
	let fired = false;
	paramsStore.subscribe((newParams) => {
		if (fired) {
			params = newParams;
		}
		fired = true;
	});

	let monitorElement: HTMLElement;

	onMount(async () => {
		const bladeApi = folder.addMonitor(params, key, options);

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
