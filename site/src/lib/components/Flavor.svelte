<script lang="ts">
	import { getContext } from 'svelte';
	import { get, type Readable, type Writable } from 'svelte/store';

	import { v4 as uuid } from 'uuid';

	import type { FolderApi, InputParams, TpChangeEvent } from 'tweakpane';

	import { type Payload, type Flavor, FlavorType, Direction } from '@types';

	import { recipeStateContextKey, type RecipeState } from '@recipe';
	import type { Terminal } from '@view';
	import { ActionType, type Action } from '@state/actions';

	import Monitor from '@components/tweakpane/Monitor.svelte';
	import Input from '@components/tweakpane/Input.svelte';
	import TerminalRack from '@components/TerminalRack.svelte';

	export let index: number;
	export let flavor: Flavor;
	export let terminals: Readable<Terminal[]>;
	export let usageUuid: string;

	$: inTerminals = $terminals.filter((terminal) => terminal.direction == Direction.In);
	$: outTerminals = $terminals.filter((terminal) => terminal.direction == Direction.Out);

	export let payload: Writable<Payload<FlavorType>> & { monitor: boolean; parameterUuid?: string };
	export let folder: FolderApi;

	const recipeState: RecipeState = getContext(recipeStateContextKey);

	let onChange: (ev: TpChangeEvent<any>) => void;
	if (!payload.monitor) {
		onChange = (ev: TpChangeEvent<any>) => {
			if (!payload.parameterUuid) {
				const createParameterAction: Action<ActionType.CreateParameter> = {
					type: ActionType.CreateParameter,
					params: {
						parameter: {
							uuid: uuid(),
							payload: {
								type: flavor.type,
								params: ev.value
							},
							recipeUuid: get(recipeState.recipeUuid),
							flavorUuid: flavor.uuid,
							usageUuid: usageUuid
						}
					}
				};
				recipeState.dispatch(createParameterAction);
			} else {
				const parameter = get(recipeState.parameters).get(payload.parameterUuid);

				if (!parameter) throw `parameter ${payload.parameterUuid} not found`;
				const updateParameterAction: Action<ActionType.UpdateParameter> = {
					type: ActionType.UpdateParameter,
					params: {
						parameter: {
							...parameter,
							payload: {
								type: get(payload).type,
								params: ev.value
							}
						}
					}
				};
				recipeState.dispatch(updateParameterAction);
			}
		};
	}

	let options: InputParams = {};

	if (flavor.type == FlavorType.Color) {
		options = { ...options, view: 'color', color: { alpha: true } };
	}
	const params = { [flavor.name]: $payload.params };
</script>

{#if payload.monitor}
	<Monitor {index} {folder} {params} key={flavor.name} let:monitorElement>
		{#each flavor.directions as direction (direction)}
			<TerminalRack
				parentElement={monitorElement}
				terminals={direction == Direction.In ? inTerminals : outTerminals}
				{direction}
			/>
		{/each}
	</Monitor>
{:else}
	<Input {index} {folder} {params} {options} {onChange} key={flavor.name} let:inputElement>
		{#each flavor.directions as direction (direction)}
			<TerminalRack
				parentElement={inputElement}
				terminals={direction == Direction.In ? inTerminals : outTerminals}
				{direction}
			/>
		{/each}
	</Input>
{/if}
