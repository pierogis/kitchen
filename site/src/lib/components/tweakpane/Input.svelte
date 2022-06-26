<script lang="ts">
	import { onMount } from 'svelte';

	import type { BladeApi, InputBindingController, TpChangeEvent } from '@tweakpane/core';
	import type { FolderApi, InputParams } from 'tweakpane';

	export let folder: FolderApi;
	export let params: { [key: string]: string | number };
	export let onChange: (ev: TpChangeEvent<string | number>) => void;
	export let key: string;
	export let options: InputParams | undefined = undefined;
	export let index: number | undefined = undefined;

	let inputElement: HTMLElement;

	onMount(() => {
		let bladeApi: BladeApi<InputBindingController<any>>;

		bladeApi = folder.addInput(params, key, { ...options, index }).on('change', onChange);

		// const element = bladeApi.controller_.valueController.view.element.parentElement;
		const element = bladeApi.element;
		if (element) {
			inputElement = element;
			// monitorElement.style.maxWidth = '9rem';
			// monitorElement.style.display = 'flex';
		}

		return () => {
			folder.remove(bladeApi);
		};
	});
</script>

<slot {inputElement} />
