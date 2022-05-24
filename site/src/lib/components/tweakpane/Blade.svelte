<script lang="ts">
	import { onDestroy } from 'svelte';

	import { get, type Writable } from 'svelte/store';

	import type { FolderApi, TpChangeEvent } from 'tweakpane';

	let folder: FolderApi;

	export let paramsStore: Writable<any>;
	export let key: string;
	export let onChange: (ev: TpChangeEvent<any>) => void;
	export let monitor = false;

	let params = get(paramsStore);

	let fired = false;

	paramsStore.subscribe((newParams) => {
		if (fired) {
			params = newParams;
		}
		fired = true;
	});

	let bladeApi;

	if (monitor) {
		bladeApi = folder.addMonitor(params, key, {
			disabled: true,
			format: (h) => h.toString()
		});
	} else {
		bladeApi = folder.addInput(params, key).on('change', onChange);
	}

	const parentElement = bladeApi.controller_.view.element.parentElement;

	onDestroy(() => {
		folder.remove(bladeApi);
	});
</script>

<slot {parentElement} />
<slot {parentElement} />
