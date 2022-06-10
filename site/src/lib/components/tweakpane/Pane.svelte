<script lang="ts">
	import { registerPlugins } from '$lib/flavors';
	import { Pane } from 'tweakpane';

	export let title: string;
	let pane: Pane;

	function attachPaneAction(element: HTMLElement) {
		pane = new Pane({ container: element, title });

		registerPlugins(pane);

		return {
			destroy() {
				pane.dispose();
			}
		};
	}
</script>

<div use:attachPaneAction>
	<slot {pane} />
</div>

<style>
	:root {
		--tp-base-background-color: var(--primary-color);
		--tp-base-shadow-color: var(--shadow-color);
		--tp-button-background-color: var(--button-color);
		--tp-button-background-color-active: var(--button-color-active);
		--tp-button-background-color-focus: var(--button-color-focus);
		--tp-button-background-color-hover: var(--button-color-hover);
		--tp-button-foreground-color: var(--label-color);
		--tp-label-foreground-color: var(--label-color);

		--tp-container-background-color: hsla(160, 5%, 20%, 0.3);
		--tp-container-background-color-active: hsla(160, 5%, 20%, 0.6);
		--tp-container-background-color-focus: hsla(160, 5%, 20%, 0.5);
		--tp-container-background-color-hover: hsla(160, 5%, 20%, 0.4);
		--tp-container-foreground-color: hsla(0, 0%, 100%, 0.5);
	}
</style>
