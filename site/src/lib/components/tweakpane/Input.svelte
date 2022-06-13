<script lang="ts">
	import type { Bindable } from '@tweakpane/core';

	import { onMount } from 'svelte';

	import { get, type Writable } from 'svelte/store';

	import type { FolderApi, InputParams, TpChangeEvent } from 'tweakpane';

	export let folder: FolderApi;

	export let paramsStore: Writable<any>;
	export let key: string;
	export let onChange: (paramsStore: Writable<Bindable>, ev: TpChangeEvent<any>) => void;
	export let options: InputParams | undefined = undefined;

	let params = get(paramsStore);

	let fired = false;
	paramsStore.subscribe((newParams) => {
		if (fired) {
			params = newParams;
		}
		fired = true;
	});

	let inputElement: HTMLElement;

	onMount(() => {
		const bladeApi = folder
			.addInput(params, key, options)
			.on('change', (ev) => onChange(paramsStore, ev));

		const element = bladeApi.controller_.valueController.view.element.parentElement;
		if (element) {
			inputElement = element;
			inputElement.style.width = '4rem';
			inputElement.style.display = 'flex';
		}

		return () => {
			folder.remove(bladeApi);
		};
	});
</script>

<slot {inputElement} />
