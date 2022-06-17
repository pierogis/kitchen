<script lang="ts">
	import type { Readable } from 'svelte/store';

	import { Direction } from '$lib/common/types';

	import type { Node } from '$lib/state/stores/view/nodes';
	import type { Cable } from '$lib/state/stores/view/cables';

	import {} from '$lib/flavors/plugins';

	import IngredientComponent from '$lib/components/Ingredient.svelte';
	import Dock from '$lib/components/Dock.svelte';
	import CableComponent from './Cable.svelte';
	import LiveTerminal from './LiveTerminal.svelte';

	import type { Terminal } from '$lib/state/stores/view';
	import type { TerminalCoordinatesState } from '$lib/state/stores/view/terminals';

	export let nodes: Readable<Node[]>;
	export let cables: Readable<Cable[]>;
	export let terminalCoordinates: TerminalCoordinatesState;
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
	<LiveTerminal
		terminal={{
			flavorUuid: undefined,
			direction: $liveTerminal.direction,
			cabled: true,
			connectionUuid: $liveTerminal.connectionUuid,
			flavorType: $liveTerminal.flavorType
		}}
	/>
{/if}

{#each $cables as cable (cable.connectionUuid)}
	<CableComponent
		inCoordinates={terminalCoordinates.getCoordinates(cable.connectionUuid, Direction.In)}
		outCoordinates={terminalCoordinates.getCoordinates(cable.connectionUuid, Direction.Out)}
	/>
{/each}

<Dock direction={Direction.In} />
<Dock direction={Direction.Out} />
