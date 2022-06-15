<script lang="ts" context="module">
	const NOVEL_CONNECTION_UUID = '-1';
</script>

<script lang="ts">
	import { writable } from 'svelte/store';

	import { terminalHeight } from '$lib/state/stores/view/terminals';
	import type { ActionDescription } from '$lib/common/actions/useActions';
	import { checkNearAction } from '$lib/common/actions/checkNear';
	import { calculateCenter } from '$lib/common/utils';
	import { Direction } from '$lib/common/types';

	import type { Terminal } from '$lib/state/stores/view/terminals';
	import TerminalComponent from '$lib/components/Terminal.svelte';
	import type { FlavorType } from '@prisma/client';
	import { getContext, onMount, tick } from 'svelte';

	import type { Connection } from '$lib/common/types';
	import { viewStateContextKey } from '$lib/state';
	import type { ViewState } from '$lib/state/stores/view';

	export let direction: Direction;
	export let container: HTMLElement | null = null;

	let near = false;

	export let flavorUuid: string;
	export let flavorName: string;
	export let flavorType: FlavorType;
	export let terminals: Terminal[];

	const nearTerminalRackDistance = 12;
	const rackHeight = 20;

	const paneOffset = 6;

	// get store containing coord stores to use to broadcast bounding rect
	// look for matching node, parameter name, direction
	// const ingredientTerminalRectCenters: Readable<{
	// 	[connectionUuid: string]: TerminalCenter;
	// }> = derived(
	// 	[terminalCenters, liveConnection],
	// 	([currentTerminalCenters, currentLiveConnection]: [TerminalCenter[], LiveConnectionState]) => {
	// 		let nodeCenters = currentTerminalCenters.filter(
	// 			(center) => center.direction == direction && center.flavorUuid == flavorUuid
	// 		);

	// 		let centerStores = nodeCenters.reduce<{
	// 			[connectionUuid: string]: TerminalCenter;
	// 		}>((currentCenterStores, center) => {
	// 			if (center.connectionUuid) {
	// 				currentCenterStores[center.connectionUuid] = center;
	// 			} else {
	// 				currentCenterStores[NOVEL_CONNECTION_ID] = center;
	// 			}
	// 			return currentCenterStores;
	// 		}, {});

	// 		// add a rect center store to update from the live connection
	// 		if (
	// 			currentLiveConnection &&
	// 			currentLiveConnection.anchorFlavorUuid == ingredientUuid &&
	// 			currentLiveConnection.anchorDirection == direction
	// 		) {
	// 			centerStores[currentLiveConnection.connectionUuid] = {
	// 				ingredientUuid: ingredientUuid,
	// 				direction: direction,
	// 				flavorName: flavorName,
	// 				connectionUuid: currentLiveConnection.connectionUuid,
	// 				flavorType: currentLiveConnection.flavorType,
	// 				coords: currentLiveConnection.anchorCoordsStore
	// 			};
	// 			if (direction == Direction.In) {
	// 				delete centerStores[NOVEL_CONNECTION_ID];
	// 			}
	// 		}

	// 		return centerStores;
	// 	},
	// 	{}
	// );

	let usingNovelTerminal = false;

	const viewState: ViewState = getContext(viewStateContextKey);

	// grabbing novel terminal should start relaying the coords of the terminal
	// and add event listeners for release
	function handleNovelGrabAction(element: HTMLElement, params: { connectionUuid: string }) {
		const handleMouseUp = (event: MouseEvent) => {
			usingNovelTerminal = false;
			window.removeEventListener('mouseup', handleMouseUp);
			element.style.cursor = '';
		};

		const handleNovelGrab = (event: MouseEvent) => {
			if (event.button == 0) {
				const dragDirection = direction == Direction.In ? Direction.Out : Direction.In;
				viewState.liveConnection.anchor(
					params.connectionUuid,
					ingredientUuid,
					flavorUuid,
					direction,
					dragDirection,
					{
						x: event.x,
						y: event.y
					}
				);
				usingNovelTerminal = true;
				window.addEventListener('mouseup', handleMouseUp);
				element.style.cursor = 'grabbing';
			}
		};

		element.addEventListener('mousedown', handleNovelGrab);

		return {
			update(newParams: { connectionUuid: string }) {
				params = newParams;
			},
			destroy() {
				element.removeEventListener('mousedown', handleNovelGrab);
			}
		};
	}

	function handleDisconnectGrabAction(element: HTMLElement, params: { connection: Connection }) {
		let handleMouseUp = () => {
			element.style.cursor = '';
			window.removeEventListener('mouseup', handleMouseUp);
		};

		let handleDisconnectGrab = (event: MouseEvent) => {
			if (event.button == 0) {
				let location = {
					x: event.x,
					y: event.y
				};
				const connection = params.connection;

				// anchorDirection is the opposite of the direction that engaged
				// this callback
				const anchorDirection = direction == Direction.In ? Direction.Out : Direction.In;

				// const flavorType = connection;

				const anchorFlavorUuid =
					anchorDirection == Direction.In ? connection.inFlavorUuid : connection.outFlavorUuid;

				viewState.liveConnection.anchor(
					params.connection.uuid,
					ingredientUuid,
					anchorFlavorUuid,
					anchorDirection,
					direction,
					location
				);

				element.style.cursor = 'grabbing';
				window.addEventListener('mouseup', handleMouseUp);
			}
		};

		element.addEventListener('mousedown', handleDisconnectGrab);

		return {
			update(newParams: { connection: Connection }) {
				params = newParams;
			},
			destroy() {
				element.removeEventListener('mousedown', handleDisconnectGrab);
			}
		};
	}

	// $: connections = $ingredientTerminalRectCenters
	// 	? Object.keys($ingredientTerminalRectCenters)
	// 	: [];

	$: expanded = near || usingNovelTerminal;

	// let terminals: {
	// 	actionDescriptions: ActionDescription<any>[];
	// 	cabled: boolean;
	// }[];
	// $: {
	// 	let showNovelTerminal;
	// 	terminals = [...connections].reduce<
	// 		{
	// 			actionDescriptions: ActionDescription<any>[];
	// 			cabled: boolean;
	// 		}[]
	// 	>((previous, connection) => {
	// 		if (connection.uuid != NOVEL_CONNECTION_UUID) {
	// 			const terminal = {
	// 				actionDescriptions: [
	// 					{
	// 						action: terminalCenterUpdateAction,
	// 						params: { connectionUuid: connection.uuid }
	// 					},
	// 					{
	// 						action: handleDisconnectGrabAction,
	// 						params: { connection }
	// 					}
	// 				],
	// 				cabled: true
	// 			};

	// 			previous.push(terminal);
	// 		} else {
	// 			showNovelTerminal = true;
	// 		}

	// 		return previous;
	// 	}, []);

	// 	if (showNovelTerminal) {
	// 		const novelTerminal = {
	// 			actionDescriptions: [
	// 				{
	// 					action: terminalCenterUpdateAction,
	// 					params: { connectionUuid: NOVEL_CONNECTION_UUID }
	// 				},
	// 				{
	// 					action: handleNovelGrabAction,
	// 					params: { connectionUuid: uuidv4() }
	// 				}
	// 			],
	// 			cabled: false
	// 		};

	// 		terminals.push(novelTerminal);
	// 	}
	// }

	// if expanded, take a width dependent on the number of terminals
	// 1 more terminal than there are connections
	$: rackWidth = !expanded
		? 4
		: ((rackHeight - terminalHeight) / 2) * (terminals.length + 1) +
		  terminalHeight * terminals.length;

	export let parentElement: HTMLElement | null;

	onMount(async () => {
		await tick();

		if (container && parentElement) {
			if (direction == Direction.In) {
				parentElement.prepend(container);
			}

			if (direction == Direction.Out) {
				parentElement.append(container);
			}
		}
	});
</script>

<div
	bind:this={container}
	class="terminal-rack"
	class:out={direction == Direction.Out}
	class:in={direction == Direction.In}
	style:--rack-width={rackWidth + 'px'}
	style:--rack-height={rackHeight + 'px'}
	style:--pane-offset={paneOffset + 'px'}
	use:checkNearAction={nearTerminalRackDistance}
	on:near={(event) => {
		near = event.detail;
	}}
>
	<div
		class="terminals-container"
		class:expanded
		style:--rack-width={rackWidth + 'px'}
		style:--rack-height={rackHeight + 'px'}
		style:--pane-offset={paneOffset + 'px'}
	>
		{#each terminals as terminal}
			<TerminalComponent
				coordinates={terminal.coordinates}
				cabled={true}
				{direction}
				{expanded}
				{terminalHeight}
			/>
		{/each}
	</div>
</div>

<style>
	.terminal-rack {
		display: flex;
		align-items: center;

		border-radius: 6px 6px 6px 6px;
		background-color: var(--primary-color);
		box-shadow: 0 2px 4px var(--shadow-color);

		position: relative;
		width: var(--rack-width);
		height: var(--rack-height);
		transition: width 300ms, margin 300ms, left 300ms, right 300ms;
	}

	.terminal-rack:hover {
		transition: all 0s;
	}

	.terminals-container {
		display: flex;
		align-items: center;
		justify-content: space-evenly;

		width: 10px;
		transition: width 300ms;
	}

	.terminals-container.expanded {
		width: var(--rack-width);
		transition: width 0ms;
	}

	.in {
		flex-direction: row-reverse;
		right: calc(var(--rack-width) + var(--pane-offset));
		margin-right: calc(0px - var(--rack-width));
	}

	.out {
		left: calc(var(--rack-width) + var(--pane-offset));
		margin-left: calc(0px - var(--rack-width));
	}
</style>
