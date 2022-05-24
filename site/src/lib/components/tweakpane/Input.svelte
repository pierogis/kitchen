<script lang="ts">
	import { onDestroy } from 'svelte';

	import { get, type Writable } from 'svelte/store';

	import type { FolderApi, InputParams, TpChangeEvent } from 'tweakpane';

	export let folder: FolderApi;

	export let paramsStore: Writable<any>;
	export let key: string;
	export let onChange: (paramsStore: Writable<any>, ev: TpChangeEvent<any>) => void;
	export let options: InputParams = null;

	let params = get(paramsStore);

	let fired = false;

	paramsStore.subscribe((newParams) => {
		if (fired) {
			params = newParams;
		}
		fired = true;
	});

	const bladeApi = folder
		.addInput(params, key, options)
		.on('change', (ev) => onChange(paramsStore, ev));

	const inputElement = bladeApi.controller_.view.element.parentElement;

	onDestroy(() => {
		folder.remove(bladeApi);
	});
</script>

<slot {inputElement} />
