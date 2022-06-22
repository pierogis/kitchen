<script lang="ts">
	import type { Readable, Writable } from 'svelte/store';

	import type { FolderApi } from 'tweakpane';

	import { type Payload, type Flavor, FlavorType, Direction } from '@types';

	import type { Terminal } from '@view';

	import Monitor from '@components/tweakpane/Monitor.svelte';
	import Input from '@components/tweakpane/Input.svelte';
	import TerminalRack from '@components/TerminalRack.svelte';

	export let index: number;
	export let flavor: Flavor;
	export let terminals: Readable<Terminal[]>;

	$: inTerminals = $terminals.filter((terminal) => terminal.direction == Direction.In);
	$: outTerminals = $terminals.filter((terminal) => terminal.direction == Direction.Out);

	export let payload: Writable<Payload<FlavorType>>;
	export let monitor: boolean;

	export let folder: FolderApi;
</script>

{#if monitor}
	<Monitor {index} {folder} payloadStore={payload} key={flavor.name} let:monitorElement>
		{#each flavor.directions as direction (direction)}
			<TerminalRack
				parentElement={monitorElement}
				terminals={direction == Direction.In ? inTerminals : outTerminals}
				{direction}
			/>
		{/each}
	</Monitor>
{:else}
	<Input {index} {folder} payloadStore={payload} key={flavor.name} let:inputElement>
		{#each flavor.directions as direction (direction)}
			<TerminalRack
				parentElement={inputElement}
				terminals={direction == Direction.In ? inTerminals : outTerminals}
				{direction}
			/>
		{/each}
	</Input>
{/if}
