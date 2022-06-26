<script lang="ts">
	import { onMount } from 'svelte';

	import type { FolderApi, MonitorParams } from 'tweakpane';
	import type { BladeApi, MonitorBindingController } from '@tweakpane/core';

	export let folder: FolderApi;
	export let params: { [key: string]: string | number };
	export let key: string;
	export let options: MonitorParams | undefined = undefined;
	export let index: number | undefined = undefined;

	let monitorElement: HTMLElement;

	onMount(() => {
		let bladeApi: BladeApi<MonitorBindingController<any>>;

		bladeApi = folder.addMonitor(params, key, { ...options, index });

		// const element = bladeApi.controller_.valueController.view.element.parentElement;
		const element = bladeApi.element;
		if (element) {
			monitorElement = element;
			// monitorElement.style.maxWidth = '9rem';
			// monitorElement.style.display = 'flex';
		}

		return () => {
			folder.remove(bladeApi);
		};
	});
</script>

<slot {monitorElement} />
