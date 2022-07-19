<script lang="ts">
	import { getContext } from 'svelte';
	import { derived, get } from 'svelte/store';

	import { Direction, PrepType, type Flavor, type FullPrep } from '@types';
	import { checkNearAction } from '$lib/common/actions/checkNear';

	import { viewStateContextKey, type ViewState } from '@view';

	import Pane from '@components/tweakpane/Pane.svelte';
	import PaneContainer from './PaneContainer.svelte';

	export let focusedUsageUuid: string;
	export let direction: Direction;
	export let preps: FullPrep<PrepType>[];
	export let flavors: Flavor[];

	let expanded = false;

	const viewState: ViewState = getContext(viewStateContextKey);

	let folded = false;
	const prepFolded = new Map(preps.map((prep) => [prep.uuid, false]));
	function handleFold(prepUuid?: string) {
		console.log('fold');
		if (prepUuid) {
			prepFolded.set(direction, !prepFolded.get(prepUuid));
		} else {
			folded = !folded;
		}
	}

	const flavorTerminals = derived(viewState.terminals, ($terminals) => {
		const flavorUuids = flavors.map((flavor) => flavor.uuid);
		return $terminals.filter(
			(terminal) => terminal.flavorUuid && flavorUuids.includes(terminal.flavorUuid)
		);
	});
	const prepTerminals = derived(viewState.terminals, ($terminals) => {
		return new Map(
			preps.map((prep) => {
				const flavorUuids = prep.flavors.map((flavor) => flavor.uuid);
				return [
					prep.uuid,
					$terminals.filter(
						(terminal) => terminal.flavorUuid && flavorUuids.includes(terminal.flavorUuid)
					)
				];
			})
		);
	});
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
	{#each preps as prep, index (prep.uuid)}
		<PaneContainer
			{direction}
			fillings={viewState.fillings}
			usageUuid={focusedUsageUuid}
			name={prep.name}
			flavors={prep.flavors}
			terminals={$prepTerminals.get(prep.uuid) || []}
		/>
	{/each}
	<PaneContainer
		{direction}
		fillings={viewState.fillings}
		usageUuid={focusedUsageUuid}
		name={'flavors'}
		{flavors}
		terminals={$flavorTerminals}
	/>
</div>

<style>
	.dock {
		position: absolute;
		top: 50%;
		overflow: visible;

		transform: translate(0%, -50%);

		border-radius: 4px;

		display: flex;
		flex-direction: column;
		gap: 10px;

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

	:global(.pane-container.expanded.in > div) {
		margin-left: 8px;
	}

	:global(.pane-container.expanded.out > div) {
		margin-right: 8px;
	}
</style>
