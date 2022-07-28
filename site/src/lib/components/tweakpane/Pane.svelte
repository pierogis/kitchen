<script lang="ts">
	import { onDestroy, createEventDispatcher } from 'svelte';
	import { Pane } from 'tweakpane';

	import { registerPlugins } from '$lib/common/plugins';

	export let container: HTMLElement;
	export let title: string | undefined = undefined;

	let pane: Pane = new Pane({ container: container, title });
	registerPlugins(pane);

	const dispatch = createEventDispatcher();
	pane.on('fold', () => {
		dispatch('fold');
	});

	onDestroy(() => {
		pane.dispose();
	});
</script>

<slot {pane} />

<style>
	:root {
		--tp-base-background-color: var(--primary-color);
		--tp-base-shadow-color: var(--shadow-color);

		/* button */
		--tp-button-background-color: var(--button-color);
		--tp-button-background-color-active: var(--button-color-active);
		--tp-button-background-color-focus: var(--button-color-focus);
		--tp-button-background-color-hover: var(--button-color-hover);
		--tp-button-foreground-color: var(--label-color);

		/* label */
		--tp-label-background-color: white;
		--tp-label-foreground-color: var(--label-color);

		/* input */
		--tp-input-background-color: var(--input-color);
		--tp-input-background-color-active: var(--input-color-active);
		--tp-input-background-color-focus: var(--input-color-focus);
		--tp-input-background-color-hover: var(--input-color-hover);
		--tp-input-foreground-color: var(--input-color-text);

		--tp-container-background-color: hsla(160, 5%, 20%, 0.3);
		--tp-container-background-color-active: hsla(160, 5%, 20%, 0.6);
		--tp-container-background-color-focus: hsla(160, 5%, 20%, 0.5);
		--tp-container-background-color-hover: hsla(160, 5%, 20%, 0.4);
		--tp-container-foreground-color: hsla(0, 0%, 100%, 0.5);
	}
</style>
