<script lang="ts">
	import { getContext } from 'svelte';
	import { get } from 'svelte/store';

	import { Direction, PrepType, type Flavor, type FullPrep } from '@types';

	import { viewStateContextKey, type ViewState } from '@view';

	import { AddTab } from '@components';
	import {
		EditFlavorsPaneContainer,
		EditPrepPaneContainer,
		PaneContainer
	} from '@components/paneContainers';
	import { Flavor as FlavorComponent } from '@components/flavors';
	import { PrepTypeSelector, FlavorTypeSelector } from '@components/selectors';

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

	const editMode = viewState.editMode;
	const fillings = viewState.fillings;

	let addingPrep = false;
	let addingFlavor = false;
</script>

<div class="dock" class:in={direction == Direction.In} class:out={direction == Direction.Out}>
	{#each preps as prep (prep.uuid)}
		{#if !$editMode}
			<PaneContainer
				{direction}
				title={prep.name}
				terminals={prepTerminals.get(prep.uuid) || []}
				let:pane
			>
				{#each prep.flavors as flavor, index (flavor.uuid)}
					<FlavorComponent
						{index}
						{flavor}
						filling={fillings.getFilling(
							flavor.uuid,
							focusedUsageUuid,
							direction && !flavor.prepUuid
								? direction
								: flavor.directions.includes(Direction.Out)
								? Direction.Out
								: Direction.In
						)}
						terminals={(prepTerminals.get(prep.uuid) || []).filter(
							(terminal) => terminal.flavorUuid == flavor.uuid
						)}
						usageUuid={focusedUsageUuid}
						{pane}
					/>
				{/each}
			</PaneContainer>
		{:else}
			<EditPrepPaneContainer {prep} terminals={prepTerminals.get(prep.uuid) || []} {direction} />
		{/if}
	{/each}
	{#if $editMode}
		{#if addingPrep}
			<PrepTypeSelector
				coordinates={get(viewState.cursor.coordinates)}
				on:destroy={() => {
					addingPrep = false;
				}}
			/>
		{:else}
			<AddTab
				attached={false}
				on:click={() => {
					addingPrep = true;
				}}
			/>
		{/if}
	{/if}

	{#if !$editMode}
		<PaneContainer {direction} title={'flavors'} terminals={flavorTerminals} let:pane>
			{#each flavors as flavor, index (flavor.uuid)}
				<FlavorComponent
					{index}
					{flavor}
					filling={fillings.getFilling(
						flavor.uuid,
						focusedUsageUuid,
						direction && !flavor.prepUuid
							? direction
							: flavor.directions.includes(Direction.Out)
							? Direction.Out
							: Direction.In
					)}
					terminals={flavorTerminals.filter((terminal) => terminal.flavorUuid == flavor.uuid)}
					usageUuid={focusedUsageUuid}
					{pane}
				/>
			{/each}
		</PaneContainer>
	{:else}
		<div class="super-pane">
			<EditFlavorsPaneContainer {flavors} terminals={flavorTerminals} {direction} />
			{#if addingFlavor}
				<FlavorTypeSelector
					coordinates={get(viewState.cursor.coordinates)}
					{direction}
					on:destroy={() => {
						addingFlavor = false;
					}}
				/>
			{:else}
				<AddTab
					attached={true}
					on:click={() => {
						addingFlavor = true;
					}}
				/>
			{/if}
		</div>
	{/if}
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
