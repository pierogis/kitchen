<script lang="ts">
	import { setContext } from 'svelte';
	import { derived, get, type Readable, type Writable } from 'svelte/store';

	import type { Pane } from 'tweakpane';

	import {
		IngredientControl,
		type IngredientControlHandle,
		ingredientsStore
	} from '../ingredients/ingredients';
	import TerminalRack from '../terminals/TerminalRack.svelte';
	import { Direction } from '../terminals/terminals';
	import {
		removeNode,
		nodesStore,
		type NodeState,
		updateNode,
		type NodeParameters,
		droppedNodeCoordsStore,
		type DockedState
	} from './nodes';

	import PaneWrapper from './PaneWrapper.svelte';
	import { draggableAction } from '../common/actions/draggableAction';

	export let draggable: boolean;
	export let ingredientId: string;
	export let dockedStatusStore: Writable<DockedState>;

	setContext('ingredientId', ingredientId);
	let dragging = false;

	// subscribe to just this node in the nodesStore
	const nodeStore: Readable<NodeState<NodeParameters>> = derived(
		nodesStore,
		($nodes) => $nodes[ingredientId]
	);

	// use these IngredientControl classes to do non svelte display stuff
	// subscribe the type specified on the node
	const ingredient: Readable<IngredientControl<any>> = derived(
		[nodeStore, ingredientsStore],
		([state, ingredients]: [
			NodeState<any>,
			{
				[ingredientName: string]: IngredientControl<{}>;
			}
		]) => state && ingredients[state.type]
	);

	// get a list of options for select type
	// just take all from the ingredients store and make them key and value
	const typeOptionsStore: Readable<{
		[typeName: string]: string;
	}> = derived(ingredientsStore, (ingredients) =>
		Object.keys(ingredients).reduce(
			(previous, current) => ({ ...previous, [current]: current }),
			{}
		)
	);

	// these will bind to the terminal racks inside
	let terminalRackContainers: {
		in: { [flavorName: string]: HTMLElement };
		out: { [flavorName: string]: HTMLElement };
	} = { in: {}, out: {} };

	// if the node type changes update the store
	function updateType(event: CustomEvent<string>) {
		let defaultNode = $ingredientsStore[event.detail].default(
			$nodeStore.ingredientId,
			get($nodeStore.coords)
		);

		updateNode(defaultNode);
	}

	// use the selected ingredient to attach inputs to tweakpane
	function attach(pane: Pane): IngredientControlHandle {
		const paramsStore = $nodeStore.parameters;
		let params = get(paramsStore);
		let parameterInputs = $ingredient.attach(pane, params, paramsStore);

		$ingredient.subscribe(pane, paramsStore, params);

		// need to know if this has an in connection
		// each of these represents a input/label
		Object.entries(parameterInputs).forEach(([flavorName, input]) => {
			input.controller_.valueController.view.element.parentElement.style.width = '100px';

			// attaching bound divs to terminal racks
			// $node.racks specifies if a rack should be attached
			if (flavorName in $nodeStore.racks.in) {
				input.controller_.view.element.prepend(terminalRackContainers.in[flavorName]);
			}

			if (flavorName in $nodeStore.racks.out) {
				input.controller_.view.element.append(terminalRackContainers.out[flavorName]);
			}
		});

		return parameterInputs;
	}

	// delete node on close button
	function handleClose(event: MouseEvent) {
		removeNode($nodeStore);
	}

	let grabTarget: HTMLElement;

	const initialLocation = get($nodeStore.coords);

	function centerOnInitialLocationAction(element: HTMLElement) {
		const midpoint = element.getBoundingClientRect().width / 2;
		element.style.left = initialLocation.x - midpoint + 'px';
	}

	const nodeHeaderSize = 12;
</script>

<div
	class="node no-select"
	style="top: {initialLocation.y - nodeHeaderSize / 2}px;"
	use:centerOnInitialLocationAction
	use:draggableAction={grabTarget}
	style:--node-header-size="{nodeHeaderSize}px"
	on:release={(event) => {
		droppedNodeCoordsStore.set({
			dockedStatusStore,
			coords: event.detail
		});
	}}
>
	<div class="header">
		<div class="grab" bind:this={grabTarget} class:dragging>
			<div class="grab-dot" />
			<div class="grab-dot" />
		</div>

		<div class="close" on:click={handleClose} />
	</div>
	<PaneWrapper
		actionDescriptions={[]}
		type={$nodeStore.type}
		typeOptions={$typeOptionsStore}
		{attach}
		on:updateType={updateType}
	/>
</div>

{#each Object.entries($nodeStore.racks.in) as [flavorName, rackState] (flavorName)}
	<TerminalRack
		bind:container={terminalRackContainers.in[flavorName]}
		{flavorName}
		flavorType={rackState.flavorType}
		direction={Direction.In}
	/>
{/each}

{#each Object.entries($nodeStore.racks.out) as [flavorName, rackState] (flavorName)}
	<TerminalRack
		bind:container={terminalRackContainers.out[flavorName]}
		{flavorName}
		flavorType={rackState.flavorType}
		direction={Direction.Out}
	/>
{/each}

<style>
	.no-select {
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
	}
	.node {
		position: absolute;
		z-index: 1;
		display: block;
	}
	.header {
		display: flex;
		height: var(--node-header-size);
		margin-bottom: 4px;
	}

	.grab {
		background-color: var(--primary-color);

		box-shadow: 0 2px 4px var(--shadow-color);

		border-radius: 6px 0px 0px 6px;

		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;

		cursor: grab;
	}
	.grab:hover {
		filter: brightness(90%) saturate(150%);
	}

	.grab-dot {
		background-color: var(--button-color-hover);
		border-radius: 50%;
		height: 4px;
		width: 4px;
		margin: 2px;
	}

	.close {
		background-color: var(--close-color);
		box-shadow: 0 2px 4px var(--primary-color-shadow);

		border-radius: 0px 6px 6px 0px;

		width: var(--node-header-size);
		margin-left: 5px;
	}

	.close:hover {
		filter: brightness(90%) saturate(150%);
		cursor: pointer;
	}
</style>
