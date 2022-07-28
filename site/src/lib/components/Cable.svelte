<script lang="ts">
	import { getContext } from 'svelte';

	import { viewStateContextKey, type Cable, type ViewState } from '@view';
	import CableInternal from './CableInternal.svelte';

	const viewState: ViewState = getContext(viewStateContextKey);

	export let cable: Cable;

	const hasTerminalsCoordinates = viewState.terminalsCoordinates.hasConnectionCoordinates(
		cable.connectionUuid
	);
</script>

{#if $hasTerminalsCoordinates}
	<CableInternal {cable} />
{/if}
