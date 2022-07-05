<script lang="ts">
	import { onMount } from 'svelte';

	import type { InputBindingApi, TpChangeEvent } from '@tweakpane/core';
	import type { FolderApi, InputParams } from 'tweakpane';
	import type { Readable } from 'svelte/store';

	export let folder: FolderApi;
	export let paramsStore: Readable<{ [key: string]: string | number }>;
	export let onChange: (ev: TpChangeEvent<string | number>) => void;
	export let key: string;
	export let options: InputParams | undefined = undefined;
	export let index: number | undefined = undefined;

	let inputElement: HTMLElement;

	onMount(() => {
		let inputApi: InputBindingApi<unknown, string | number>;

		let params = $paramsStore;
		inputApi = folder.addInput(params, key, { ...options, index }).on('change', onChange);

		// const element = inputApi.controller_.valueController.view.element.parentElement;
		const element = inputApi.element;
		if (element) {
			inputElement = element;
			// monitorElement.style.maxWidth = '9rem';
			// monitorElement.style.display = 'flex';
		}

		return () => {
			inputApi.dispose();
			folder.remove(inputApi);
		};
	});
</script>

<slot {inputElement} />
