<script lang="ts">
	import { getContext } from 'svelte';
	import { derived, get, type Readable } from 'svelte/store';

	import { v4 as uuid } from 'uuid';

	import type { FolderApi, InputParams, TpChangeEvent } from 'tweakpane';
	import * as THREE from 'three';

	import { type Flavor, FlavorType, Direction } from '@types';

	import { recipeStateContextKey, type RecipeState } from '@recipe';
	import { viewStateContextKey, type Terminal, type ViewState } from '@view';
	import { ActionType, type Action } from '@state/actions';

	import Monitor from '@components/tweakpane/Monitor.svelte';
	import Input from '@components/tweakpane/Input.svelte';
	import TerminalRack from '@components/TerminalRack.svelte';
	import type { Filling } from '@view/fillings';
	import type { CanvasValue } from '$lib/common/plugins/canvas/view';
	import { Plane } from 'three';

	export let index: number;
	export let flavor: Flavor;
	export let terminals: Readable<Terminal[]>;
	export let usageUuid: string;

	$: inTerminals = $terminals.filter((terminal) => terminal.direction == Direction.In);
	$: outTerminals = $terminals.filter((terminal) => terminal.direction == Direction.Out);

	export let filling: Filling;
	export let folder: FolderApi;

	const recipeState: RecipeState = getContext(recipeStateContextKey);
	const viewState: ViewState = getContext(viewStateContextKey);

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

	let options: InputParams = flavor.options || {};

	if (flavor.type == FlavorType.Color) {
		options = { ...options, view: 'color', color: { alpha: true } };
	}

	let paramsStore: Readable<{ [key: string]: string | number | CanvasValue }>;
	if (flavor.type == FlavorType.Geometry) {
		options = { ...options, view: 'canvas' };
		const scene = new THREE.Scene();

		paramsStore = derived([filling.payload, viewState.defaultCamera], ([$payload, $camera]) => {
			scene.clear();
			const geometry = $payload.value as THREE.BufferGeometry;

			if (geometry.isBufferGeometry) {
				scene.add(new THREE.Mesh(geometry));
			} else {
				throw 'payload value is wrong type';
			}
			return { [flavor.name]: { scene, camera: $camera } };
		});
	} else if (flavor.type == FlavorType.Object) {
		options = { ...options, view: 'canvas' };
		const scene = new THREE.Scene();

		paramsStore = derived([filling.payload, viewState.defaultCamera], ([$payload, $camera]) => {
			scene.clear();

			const object = $payload.value as THREE.Object3D;
			if (object.isObject3D) {
				scene.add(object);
			} else {
				throw 'payload value is wrong type';
			}
			return { [flavor.name]: { scene, camera: $camera } };
		});
	} else if (flavor.type == FlavorType.Texture) {
		options = { ...options, view: 'canvas' };
		const scene = new THREE.Scene();

		paramsStore = derived([filling.payload, viewState.defaultCamera], ([$payload, $camera]) => {
			scene.clear();
			const texture = $payload.value as THREE.Texture;
			if (texture.isTexture) {
				const plane = new THREE.PlaneBufferGeometry();
				const material = new THREE.MeshBasicMaterial({ map: texture });

				scene.add(new THREE.Mesh(plane, material));
			} else {
				throw 'payload value is wrong type';
			}
			return { [flavor.name]: { scene, camera: $camera } };
		});
	} else {
		paramsStore = derived(filling.payload, ($payload) => {
			if (typeof $payload.value != 'string' && typeof $payload.value != 'number')
				throw 'payload value is wrong type';

			return { [flavor.name]: $payload.value };
		});
	}

	const monitor = derived(filling.monitorStatus, ($monitorStatus) => {
		return $monitorStatus.monitor;
	});
</script>

{#if $monitor}
	<Monitor {index} {folder} {paramsStore} {options} key={flavor.name} let:monitorElement>
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
	</Monitor>
{:else}
	<Input
		{index}
		{folder}
		{paramsStore}
		{options}
		onChange={$onChange}
		key={flavor.name}
		let:inputElement
	>
		{#each flavor.directions as direction (direction)}
			<TerminalRack
				parentElement={inputElement}
				terminals={direction == Direction.In ? inTerminals : outTerminals}
				{direction}
			/>
		{/each}
	</Input>
{/if}
