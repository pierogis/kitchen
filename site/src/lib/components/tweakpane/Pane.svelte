<script lang="ts">
	import { registerPlugins } from '$lib/flavors';
	import { Pane } from 'tweakpane';

	let pane: Pane;

	function attachPaneAction(element: HTMLElement) {
		pane = new Pane({ container: element });

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
