<script lang="ts">
	import { getContext } from 'svelte';
	import { derived, get, type Readable } from 'svelte/store';

	import { v4 as uuid } from 'uuid';

	import type { InputParams, MonitorParams, Pane, TpChangeEvent } from 'tweakpane';

	import { type Flavor, Direction } from '@types';

	import { recipeStateContextKey, type RecipeState } from '@recipe';
	import type { Terminal } from '@view';
	import type { Filling } from '@view/fillings';
	import { ActionType, type Action } from '@state/actions';

	import { Monitor, Input } from './tweakpane';
	import TerminalRack from '@components/TerminalRack.svelte';

	import { flavorComponents } from './flavors';

	export let index: number;
	export let flavor: Flavor;
	export let terminals: Terminal[];
	export let usageUuid: string;

	$: inTerminals = terminals.filter((terminal) => terminal.direction == Direction.In);
	$: outTerminals = terminals.filter((terminal) => terminal.direction == Direction.Out);

	export let filling: Filling;
	export let pane: Pane;

	const recipeState: RecipeState = getContext(recipeStateContextKey);

	let onChange: Readable<(ev: TpChangeEvent<any>) => void> = derived(
		[filling.monitorStatus],
		([$monitorStatus]) => {
			return (ev: TpChangeEvent<any>) => {
				if (!$monitorStatus.parameterUuid) {
					const createParameterAction: Action<ActionType.CreateParameters> = {
						type: ActionType.CreateParameters,
						params: {
							parameters: [
								{
									uuid: uuid(),
									payload: {
										type: flavor.type,
										value: ev.value
									},
									recipeUuid: get(recipeState.recipeUuid),
									flavorUuid: flavor.uuid,
									usageUuid: usageUuid
								}
							]
						}
					};
					recipeState.dispatch(createParameterAction);
				} else {
					const parameter = get(recipeState.parameters).get($monitorStatus.parameterUuid);

					if (!parameter) throw `parameter ${$monitorStatus.parameterUuid} not found`;
					const updateParameterAction: Action<ActionType.UpdateParameters> = {
						type: ActionType.UpdateParameters,
						params: {
							parameters: [
								{
									...parameter,
									payload: {
										type: get(filling.payload).type,
										value: ev.value
									}
								}
							]
						}
					};
					recipeState.dispatch(updateParameterAction);
				}
			};
		}
	);

	let options: InputParams | MonitorParams = flavor.options || {};

	const monitor = derived(filling.monitorStatus, ($monitorStatus) => {
		return $monitorStatus.monitor;
	});
</script>

<svelte:component
	this={flavorComponents[flavor.type]}
	{filling}
	{options}
	name={flavor.name}
	let:paramsStore
	let:optParams
>
	{#if $monitor}
		<Monitor
			{index}
			folder={pane}
			{paramsStore}
			monitorParams={optParams}
			key={flavor.name}
			interval={32}
			let:monitorElement
		>
			{#if monitorElement}
				{#if inTerminals.length > 0}
					<TerminalRack
						parentElement={monitorElement}
						terminals={inTerminals}
						direction={Direction.In}
					/>
				{/if}

				{#if outTerminals.length > 0}
					<TerminalRack
						parentElement={monitorElement}
						terminals={outTerminals}
						direction={Direction.Out}
					/>
				{/if}
			{/if}
		</Monitor>
	{:else}
		<Input
			{index}
			folder={pane}
			{paramsStore}
			inputParams={optParams}
			onChange={(ev) => $onChange(ev)}
			key={flavor.name}
			let:inputElement
		>
			{#if inputElement}
				{#each flavor.directions as direction (direction)}
					<TerminalRack
						parentElement={inputElement}
						terminals={direction == Direction.In ? inTerminals : outTerminals}
						{direction}
					/>
				{/each}
			{/if}
		</Input>
	{/if}
</svelte:component>
