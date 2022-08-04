<script lang="ts">
	import { onMount } from 'svelte';
	import type { Readable } from 'svelte/store';

	import type { InputBindingApi, TpChangeEvent } from '@tweakpane/core';
	import type { FolderApi, InputParams } from 'tweakpane';

	import type { CanvasValue } from '$lib/common/plugins/canvas/view';

	// generic for the bound value type of this input
	type T = $$Generic<string | number | CanvasValue>;

	export let folder: FolderApi;
	export let paramsStore: Readable<{ [key: string]: T }>;
	export let onChange: (ev: TpChangeEvent<T>) => void;
	export let key: string;
	export let inputParams: InputParams | undefined = undefined;
	export let index: number | undefined = undefined;

	let inputElement: HTMLElement;

	onMount(() => {
		let params = $paramsStore;
		const inputApi: InputBindingApi<unknown, T> = folder
			.addInput(params, key, { ...inputParams, index })
			.on('change', onChange);

		inputElement = inputApi.element;
		// inputElement.style.maxWidth = '9rem';
		// inputElement.style.display = 'flex';

		return () => {
			inputApi.dispose();
			folder.remove(inputApi);
		};
	});
</script>

<slot {inputElement} />
