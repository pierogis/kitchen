<script lang="ts">
	import type { Readable } from 'svelte/store';

	import { Direction, type Flavor, type FullPrep } from '@types';

	import type { Terminal, Node, Cable } from '@view';
	import type { TerminalsCoordinatesState } from '@view/terminals';

	import {} from '$lib/flavors/plugins';

	import IngredientComponent from '@components/Ingredient.svelte';
	import Dock from '@components/Dock.svelte';
	import CableComponent from '@components/Cable.svelte';
	import LiveTerminal from '@components/LiveTerminal.svelte';

	export let focusedUsageUuid: Readable<string>;
	export let dockedFlavors: Readable<Flavor[]>;
	export let preps: Readable<FullPrep[]>;
	export let nodes: Readable<Node[]>;
	export let cables: Readable<Cable[]>;
	export let terminalsCoordinates: TerminalsCoordinatesState;
	export let liveTerminal: Readable<Terminal | undefined>;

	export let width: number;
	export let height: number;

	const pathStrokeWidth = 2;
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

<svg style:--path-stroke-width="{pathStrokeWidth}px" {width} {height}>
	{#each $cables as cable (cable.connectionUuid)}
		<CableComponent
			outCoordinates={terminalsCoordinates.getCoordinates(cable.connectionUuid, Direction.Out)}
			inCoordinates={terminalsCoordinates.getCoordinates(cable.connectionUuid, Direction.In)}
		/>
	{/each}
</svg>

<Dock
	direction={Direction.In}
	flavors={$dockedFlavors.filter((flavor) => flavor.directions.includes(Direction.Out))}
	focusedUsageUuid={$focusedUsageUuid}
/>
<Dock
	direction={Direction.Out}
	preps={$preps}
	flavors={$dockedFlavors.filter((flavor) => flavor.directions.includes(Direction.In))}
	focusedUsageUuid={$focusedUsageUuid}
/>

<style>
	svg {
		display: block;
	}
</style>
