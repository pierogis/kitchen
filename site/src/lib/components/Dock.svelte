<script lang="ts">
	import { getContext } from 'svelte';

	import { Direction, PrepType, type Flavor, type FullPrep } from '@types';

	import { viewStateContextKey, type ViewState } from '@view';

	import PaneContainer from './PaneContainer.svelte';

	export let focusedUsageUuid: string;
	export let direction: Direction;
	export let preps: FullPrep<PrepType>[];
	export let flavors: Flavor[];

	const viewState: ViewState = getContext(viewStateContextKey);

	const terminals = viewState.terminals;

	$: flavorUuids = flavors.map((flavor) => flavor.uuid);

	$: flavorTerminals = $terminals.filter(
		(terminal) => terminal.flavorUuid && flavorUuids.includes(terminal.flavorUuid)
	);

	$: prepTerminals = new Map(
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
</script>

<div class="dock" class:in={direction == Direction.In} class:out={direction == Direction.Out}>
	{#each preps as prep (prep.uuid)}
		<PaneContainer
			{direction}
			usageUuid={focusedUsageUuid}
			name={prep.name}
			flavors={prep.flavors}
			terminals={prepTerminals.get(prep.uuid) || []}
		/>
	{/each}
	<PaneContainer
		{direction}
		usageUuid={focusedUsageUuid}
		name={'flavors'}
		{flavors}
		terminals={flavorTerminals}
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
	}
	.in {
		left: 0%;
		justify-content: left;

		align-items: start;
	}
	.out {
		right: 0%;
		justify-content: right;

		align-items: end;
	}
</style>
