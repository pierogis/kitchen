<script lang="ts">
	import { writable } from 'svelte/store';

	import { type Prep, type Flavor, PrepType, Direction } from '@types';

	import { Pane, Input } from './tweakpane';
	import type { Terminal } from '@view';
	import TerminalRack from './TerminalRack.svelte';
	import Folder from './tweakpane/Folder.svelte';
	import { FlavorType } from '@prisma/client';

	export let prep: Prep<PrepType> | undefined;
	export let flavors: Flavor[] | undefined;
	export let terminals: Terminal[];
	export let direction: Direction;

	function handleNameUpdate() {}
	function handleTypeUpdate() {}

	let paneContainer: HTMLElement;

	const prepTypes = { add: PrepType.Add };
	const flavorTypes = { number: FlavorType.Number };

	$: inTerminals = terminals.filter((terminal) => terminal.direction == Direction.In);
	$: outTerminals = terminals.filter((terminal) => terminal.direction == Direction.Out);

	let expanded = true;
</script>

<div class="pane-container no-select" bind:this={paneContainer}>
	{#if paneContainer}
		<Pane
			title={flavors ? 'flavors' : undefined}
			container={paneContainer}
			let:pane
			on:fold={() => (expanded = !expanded)}
		>
			{#if expanded}
				{#if prep}
					<Input
						folder={pane}
						paramsStore={writable({ name: prep.name })}
						key={'name'}
						onChange={(event) => console.log(event.value)}
					/>
					<Input
						folder={pane}
						paramsStore={writable({ type: prep.type })}
						key={'type'}
						inputParams={{ options: prepTypes }}
						onChange={(event) => console.log(event.value)}
					/>
					<!-- need terminals if hidden -->
					{#if inTerminals.length > 0 && direction != Direction.In}
						<TerminalRack
							parentElement={paneContainer}
							terminals={inTerminals}
							direction={Direction.In}
						/>
					{/if}
					{#if outTerminals.length > 0 && direction != Direction.Out}
						<TerminalRack
							parentElement={paneContainer}
							terminals={outTerminals}
							direction={Direction.Out}
						/>
					{/if}
				{:else if flavors}
					{#each flavors as flavor}
						<Folder {pane} title={flavor.name} let:folder let:folderContainer>
							{#if folderContainer}
								<Input
									{folder}
									paramsStore={writable({ name: flavor.name })}
									key={'name'}
									onChange={(event) => console.log(event.value)}
								/>
								<Input
									{folder}
									paramsStore={writable({ type: flavor.type })}
									key={'type'}
									onChange={(event) => console.log(event.value)}
									inputParams={{ options: flavorTypes }}
								/>
								<!-- need terminals if hidden -->
								{#if inTerminals.length > 0 && direction != Direction.In}
									<TerminalRack
										parentElement={folderContainer}
										terminals={inTerminals.filter(
											(terminal) =>
												terminal.flavorUuid == flavor.uuid && terminal.direction != direction
										)}
										direction={Direction.In}
									/>
								{/if}
								{#if outTerminals.length > 0 && direction != Direction.Out}
									<TerminalRack
										parentElement={folderContainer}
										terminals={outTerminals.filter(
											(terminal) =>
												terminal.flavorUuid == flavor.uuid && terminal.direction != direction
										)}
										direction={Direction.Out}
									/>
								{/if}
							{/if}
						</Folder>
					{/each}
				{/if}
			{/if}
		</Pane>

		{#if !expanded}
			{#if inTerminals.length > 0 && direction != Direction.In}
				<TerminalRack
					parentElement={paneContainer}
					terminals={inTerminals}
					direction={Direction.In}
				/>
			{/if}
			{#if outTerminals.length > 0 && direction != Direction.Out}
				<TerminalRack
					parentElement={paneContainer}
					terminals={outTerminals}
					direction={Direction.Out}
				/>
			{/if}
		{/if}
	{/if}
</div>

<style>
	.pane-container {
		display: flex;
		place-items: center;
	}
</style>
