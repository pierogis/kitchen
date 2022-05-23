<script lang="ts" context="module">
	const NOVEL_CONNECTION_ID = 'novel';
</script>

<script lang="ts">
	import { v4 as uuidv4 } from 'uuid';
	import { derived, type Readable } from 'svelte/store';

	import {
		allNodesTerminalCentersStore,
		type TerminalCentersState,
		terminalHeight
	} from './terminals';
	import {
		anchorLiveConnection,
		type LiveConnectionState,
		liveConnectionStore
	} from '../connections/live-connection';
	import type { ActionDescription } from '../common/actions/useActions';
	import { checkNearAction } from '../common/actions/checkNear';
	import { calculateCenter } from '../common/utils';
	import { connectionsStore, removeConnection } from '../connections';
	import { Direction } from '$lib/common/types';

	import Terminal from './Terminal.svelte';
	import type { FlavorType } from '$lib/flavors';

	export let direction: Direction;
	export let container: HTMLElement;

	let near: boolean = false;

	export let ingredientId: number;
	export let flavorName: string;
	export let flavorType: FlavorType;

	const nearTerminalRackDistance = 12;
	const rackHeight = 20;

	const paneOffset = 6;

	// get store containing coord stores to use to broadcast bounding rect
	// look for matching node, parameter name, direction
	const nodeTerminalRectCenterStores: Readable<{
		[connectionId: string]: TerminalCentersState;
	}> = derived(
		[allNodesTerminalCentersStore, liveConnectionStore],
		([allNodeTerminalCenters, liveConnection]: [TerminalCentersState[], LiveConnectionState]) => {
			let nodeCenters = allNodeTerminalCenters.filter((center) => {
				return (
					center.ingredientId == ingredientId &&
					center.direction == direction &&
					center.flavorName == flavorName
				);
			});

			let centerStores = nodeCenters.reduce<{
				[connectionId: string]: TerminalCentersState;
			}>((currentCenterStores, center) => {
				if (center.connectionId) {
					currentCenterStores[center.connectionId] = center;
				} else {
					currentCenterStores[NOVEL_CONNECTION_ID] = center;
				}
				return currentCenterStores;
			}, {});

			// add a rect center store to update from the live connection
			if (
				liveConnection &&
				liveConnection.anchorNodeId == ingredientId &&
				liveConnection.anchorDirection == direction &&
				liveConnection.anchorParameterName == flavorName
			) {
				centerStores[liveConnection.connectionId] = {
					ingredientId: ingredientId,
					direction: direction,
					flavorName: flavorName,
					connectionId: liveConnection.connectionId,
					flavorType: liveConnection.flavorType,
					coords: liveConnection.anchorCoordsStore
				};
				if (direction == Direction.In) {
					delete centerStores[NOVEL_CONNECTION_ID];
				}
			}

			return centerStores;
		},
		{}
	);

	function terminalCenterUpdateAction(element: HTMLElement, params: { connectionId: string }) {
		let updateRect = () => {
			// don't bother if there are none to call
			if (
				$nodeTerminalRectCenterStores &&
				Object.entries($nodeTerminalRectCenterStores).length > 0
			) {
				// calculate the rect and dispatch to the callback
				let rect: DOMRect = element.getBoundingClientRect();
				// accounts for scroll
				rect.x += window.pageXOffset;
				rect.y += window.pageYOffset;
				let center = calculateCenter(rect);
				$nodeTerminalRectCenterStores[params.connectionId].coords.set({
					x: center.x,
					y: center.y
				});
			}
		};

		let rectUpdateInterval = setInterval(updateRect, 10);
		return {
			update(newParams: { connectionId: string }) {
				params = newParams;
			},
			destroy() {
				clearInterval(rectUpdateInterval);
			}
		};
	}
	let usingNovelTerminal = false;

	// grabbing novel terminal should start relaying the coords of the terminal
	// and add event listeners for release
	function handleNovelGrabAction(element: HTMLElement, params: { connectionId: number }) {
		const handleMouseUp = (event: MouseEvent) => {
			usingNovelTerminal = false;
			window.removeEventListener('mouseup', handleMouseUp);
			element.style.cursor = '';
		};

		const handleNovelGrab = (event: MouseEvent) => {
			if (event.button == 0) {
				const dragDirection = direction == Direction.In ? Direction.Out : Direction.In;
				anchorLiveConnection(
					params.connectionId,
					ingredientId,
					flavorName,
					direction,
					dragDirection,
					flavorType,
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
			update(newParams: { connectionId: number }) {
				params = newParams;
			},
			destroy() {
				element.removeEventListener('mousedown', handleNovelGrab);
			}
		};
	}

	function handleDisconnectGrabAction(element: HTMLElement, params: { connectionId: number }) {
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
				const connection = $connectionsStore[params.connectionId];

				// anchorDirection is the opposite of the direction that engaged
				// this callback
				const anchorDirection = direction == Direction.In ? Direction.Out : Direction.In;

				const flavorType = connection.flavorType;

				const { ingredientId: anchorNodeId, flavorName: anchorParameterName } =
					connection[anchorDirection];
				removeConnection(params.connectionId);

				anchorLiveConnection(
					params.connectionId,
					anchorNodeId,
					anchorParameterName,
					anchorDirection,
					direction,
					flavorType,
					location
				);

				element.style.cursor = 'grabbing';
				window.addEventListener('mouseup', handleMouseUp);
			}
		};

		element.addEventListener('mousedown', handleDisconnectGrab);

		return {
			update(newParams: { connectionId: number }) {
				params = newParams;
			},
			destroy() {
				element.removeEventListener('mousedown', handleDisconnectGrab);
			}
		};
	}

	$: connectionIds = $nodeTerminalRectCenterStores
		? Object.keys($nodeTerminalRectCenterStores)
		: [];

	$: expanded = near || usingNovelTerminal;

	let terminals: {
		actionDescriptions: ActionDescription<any>[];
		cabled: boolean;
	}[];
	$: {
		let showNovelTerminal;
		terminals = [...connectionIds].reduce<
			{
				actionDescriptions: ActionDescription<any>[];
				cabled: boolean;
			}[]
		>((result, connectionId) => {
			if (connectionId != NOVEL_CONNECTION_ID) {
				const terminal = {
					actionDescriptions: [
						{
							action: terminalCenterUpdateAction,
							params: { connectionId: connectionId }
						},
						{
							action: handleDisconnectGrabAction,
							params: { connectionId: connectionId }
						}
					],
					cabled: true
				};

				result.push(terminal);
			} else {
				showNovelTerminal = true;
			}

			return result;
		}, []);

		if (showNovelTerminal) {
			const novelTerminal = {
				actionDescriptions: [
					{
						action: terminalCenterUpdateAction,
						params: { connectionId: NOVEL_CONNECTION_ID }
					},
					{
						action: handleNovelGrabAction,
						params: { connectionId: uuidv4() }
					}
				],
				cabled: false
			};

			terminals.push(novelTerminal);
		}
	}

	// if expanded, take a width dependent on the number of terminals
	// 1 more terminal than there are connections
	$: rackWidth = !expanded
		? 4
		: ((rackHeight - terminalHeight) / 2) * (terminals.length + 1) +
		  terminalHeight * terminals.length;
</script>

<div
	bind:this={container}
	class="terminal-rack {direction}"
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
		{#each Object.entries(terminals) as [connectionId, terminal] (connectionId)}
			<Terminal
				actionDescriptions={terminal.actionDescriptions}
				cabled={terminal.cabled}
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
