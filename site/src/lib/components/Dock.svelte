<script lang="ts">
	import { getContext } from 'svelte';

	import { Direction, PrepType, type Flavor, type FullPrep } from '@types';

	import { viewStateContextKey, type ViewState } from '@view';

	import PaneContainer from './PaneContainer.svelte';
	import AddTab from './AddTab.svelte';

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
		<div class="super-pane">
			<PaneContainer
				{direction}
				usageUuid={focusedUsageUuid}
				name={prep.name}
				flavors={prep.flavors}
				terminals={prepTerminals.get(prep.uuid) || []}
			/>
		</div>
	{/each}
	<AddTab attached={false} />
	<div class="super-pane">
		<PaneContainer
			{direction}
			usageUuid={focusedUsageUuid}
			name={'flavors'}
			{flavors}
			terminals={flavorTerminals}
		/>
		<AddTab attached={true} />
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
		flex-direction: column;
		gap: 10px;
	}
	.in {
		left: 0%;
		justify-content: left;

		align-items: flex-start;
	}
	.out {
		right: 0%;
		justify-content: right;

		align-items: flex-end;
	}

	.super-pane {
		display: flex;
		flex-direction: column;
		place-items: center;
	}
</style>
