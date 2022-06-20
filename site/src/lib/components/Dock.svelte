<script lang="ts">
	import { getContext } from 'svelte';
	import { derived } from 'svelte/store';

	import { Direction, type Flavor } from '$lib/common/types';
	import { viewStateContextKey } from '$lib/state';
	import type { ViewState } from '$lib/state/stores/view';

	import { checkNearAction } from '$lib/common/actions/checkNear';

	import FlavorComponent from './Flavor.svelte';
	import Pane from './tweakpane/Pane.svelte';

	export let direction: Direction;
	export let flavors: Flavor[];
	let expanded = false;

	const viewState: ViewState = getContext(viewStateContextKey);

	$: cables = viewState.cables;
</script>

<div
	class="dock"
	class:expanded
	class:in={direction == Direction.In}
	class:out={direction == Direction.Out}
	use:checkNearAction={10}
	on:near={(event) => {
		expanded = event.detail;
	}}
>
	<Pane let:pane>
		{#each flavors as flavor, index (flavor.uuid)}
			<!-- inPayload could have a  not necessarily based on cables -->
			<FlavorComponent
				{index}
				{flavor}
				inPayload={direction == Direction.In
					? undefined
					: $cables.find((cable) => cable.inFlavorUuid == flavor.uuid)?.payload}
				outPayloads={direction == Direction.Out
					? []
					: $cables
							.filter((cable) => cable.outFlavorUuid == flavor.uuid)
							.map((cable) => cable.payload)}
				terminals={derived(viewState.terminals, (currentTerminals) =>
					currentTerminals.filter(
						(terminal) =>
							terminal.flavorUuid == flavor.uuid &&
							terminal.direction == (direction == Direction.In ? Direction.Out : Direction.In)
					)
				)}
				folder={pane}
			/>
		{/each}
	</Pane>
</div>

<style>
	.dock {
		position: absolute;
		right: 0%;
		top: 50%;

		transform: translate(0%, -50%);

		height: 90vh;
		width: 10px;

		background-color: var(--primary-color);
		border-radius: 4px;

		transition: width 0.2s;

		display: flex;
		align-items: center;
	}
	.expanded {
		width: 40px;
	}
	.in {
		left: 0%;
		justify-content: left;
	}
	.out {
		right: 0%;
		justify-content: right;
	}
</style>
