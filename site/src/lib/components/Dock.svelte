<script lang="ts">
	import { getContext } from 'svelte';
	import { derived } from 'svelte/store';

	import { Direction, type Flavor } from '@types';
	import { checkNearAction } from '$lib/common/actions/checkNear';

	import { viewStateContextKey, type ViewState } from '@view';

	import FlavorComponent from '@components/Flavor.svelte';
	import Pane from '@components/tweakpane/Pane.svelte';

	export let focusedUsageUuid: string;
	export let direction: Direction;
	export let flavors: Flavor[];
	let expanded = false;

	const viewState: ViewState = getContext(viewStateContextKey);

	let paneContainer: HTMLElement;
</script>

<div
	class="dock"
	class:in={direction == Direction.In}
	class:out={direction == Direction.Out}
	use:checkNearAction={64}
	on:near={(event) => {
		expanded = event.detail;
	}}
>
	<div
		bind:this={paneContainer}
		class:expanded
		class:in={direction == Direction.In}
		class:out={direction == Direction.Out}
		class="pane-container no-select"
	>
		{#if paneContainer}
			<Pane container={paneContainer} let:pane>
				{#each flavors as flavor, index (flavor.uuid)}
					<FlavorComponent
						{index}
						{flavor}
						filling={viewState.fillings.getFilling(
							flavor.uuid,
							focusedUsageUuid,
							flavor.directions.includes(Direction.Out) ? Direction.Out : Direction.In
						)}
						terminals={derived(viewState.terminals, (currentTerminals) =>
							currentTerminals.filter((terminal) => terminal.flavorUuid == flavor.uuid)
						)}
						usageUuid={focusedUsageUuid}
						folder={pane}
					/>
				{/each}
			</Pane>
		{/if}
	</div>
</div>

<style>
	.dock {
		position: absolute;
		top: 50%;
		overflow: visible;

		transform: translate(0%, -50%);

		border-radius: 4px;

		display: flex;
		align-items: center;
	}
	.in {
		left: 0%;
		justify-content: left;
	}
	.out {
		right: 0%;
		justify-content: right;
	}

	:global(.pane-container > div) {
		transition: margin-left 0.5s, margin-right 0.5s;
	}

	:global(.pane-container.in > div) {
		margin-left: 8px;
	}

	:global(.pane-container.out > div) {
		margin-right: 8px;
	}

	:global(.pane-container.expanded.in > div) {
		margin-left: 8px;
	}

	:global(.pane-container.expanded.out > div) {
		margin-right: 8px;
	}
</style>
