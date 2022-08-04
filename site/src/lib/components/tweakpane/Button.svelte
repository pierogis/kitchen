<script lang="ts">
	import { onMount } from 'svelte';

	import type { FolderApi } from 'tweakpane';
	import type { TpEvent } from '@tweakpane/core';

	export let folder: FolderApi;
	export let title: string;
	export let onClick: (ev: TpEvent) => void;
	export let index: number | undefined = undefined;

	let buttonElement: HTMLElement;

	onMount(() => {
		const buttonApi = folder.addButton({
			title,
			index
		});

		buttonApi.on('click', onClick);

		buttonElement = buttonApi.element;

		return () => {
			buttonApi.dispose();
			folder.remove(buttonApi);
		};
	});
</script>

<slot {buttonElement} />
