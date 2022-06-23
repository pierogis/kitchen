<script lang="ts">
	import type { Readable } from 'svelte/store';

	import { Direction, type Flavor } from '@types';

	import type { Terminal, Node, Cable } from '@view';
	import type { TerminalsCoordinatesState } from '@view/terminals';

	import {} from '$lib/flavors/plugins';

	import IngredientComponent from '@components/Ingredient.svelte';
	import Dock from '@components/Dock.svelte';
	import CableComponent from '@components/Cable.svelte';
	import LiveTerminal from '@components/LiveTerminal.svelte';

	export let focusedUsageUuid: Readable<string>;
	export let dockedFlavors: Readable<Flavor[]>;
	export let nodes: Readable<Node[]>;
	export let cables: Readable<Cable[]>;
	export let terminalsCoordinates: TerminalsCoordinatesState;
	export let liveTerminal: Readable<Terminal | undefined>;
</script>

{#each $nodes as node (node.callFor.uuid)}
	<IngredientComponent
		ingredient={node.ingredient}
		flavors={node.flavors}
		callFor={node.callFor}
		location={node.location}
	/>
{/each}

{#if $liveTerminal}
	<LiveTerminal terminal={$liveTerminal} />
{/if}

{#each $cables as cable (cable.connectionUuid)}
	<CableComponent
		outCoordinates={terminalsCoordinates.getCoordinates(cable.connectionUuid, Direction.Out)}
		inCoordinates={terminalsCoordinates.getCoordinates(cable.connectionUuid, Direction.In)}
	/>
{/each}

<Dock
	direction={Direction.In}
	flavors={$dockedFlavors.filter((flavor) => flavor.directions.includes(Direction.Out))}
	focusedUsageUuid={$focusedUsageUuid}
/>
<Dock
	direction={Direction.Out}
	flavors={$dockedFlavors.filter((flavor) => flavor.directions.includes(Direction.In))}
	focusedUsageUuid={$focusedUsageUuid}
/>
