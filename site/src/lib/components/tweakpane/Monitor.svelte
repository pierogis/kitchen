<script lang="ts">
	import { onDestroy } from 'svelte';

	import { get, type Writable } from 'svelte/store';

	import type { FolderApi, MonitorParams } from 'tweakpane';

	export let folder: FolderApi;

	export let paramsStore: Writable<any>;
	export let key: string;
	export let options: MonitorParams = null;

	let params = get(paramsStore);

	let fired = false;

	paramsStore.subscribe((newParams) => {
		if (fired) {
			params = newParams;
		}
		fired = true;
	});

	let bladeApi = folder.addMonitor(params, key, options);

	const monitorElement = bladeApi.controller_.valueController.view.element.parentElement;
	monitorElement.style.width = '100px';
	monitorElement.style.display = 'flex';

	onDestroy(() => {
		folder.remove(bladeApi);
	});
</script>

<slot {monitorElement} />
