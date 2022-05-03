import { derived, writable, type Writable } from 'svelte/store';

import { connectionsStore } from '$lib/connections/connections';
import { nodesStore } from '$lib/nodes/nodes';

import { Direction } from '$lib/common/types';
import type { FlavorType } from '$lib/flavors';

export const terminalHeight = 10;

export type TerminalCentersState = {
	ingredientId: string;
	direction: Direction;
	flavorName: string;
	connectionId: string | null;
	flavorType: FlavorType;
	coords: Writable<{ x: number; y: number }>;
};

export const allNodesTerminalCentersStore = derived(
	[nodesStore, connectionsStore],
	([nodes, connections]) => {
		let connectionCenters: TerminalCentersState[] = [];

		Object.entries(connections).forEach(([connectionId, connection]) => {
			// the context is keyed by ingredientId as a string
			// using an object key requires matching the reference
			// maybe pass down through props
			let inNodeId = connection.in.ingredientId;
			// do the same for out
			let outNodeId = connection.out.ingredientId;

			// add to the callbacks set for the given connection's "in" parameter name
			// this corresponds to the in (left) terminal on parameters

			// using a store to ultimately notify terminals of a new callback to use when
			// they providing updates on their bounding rect
			// use the out callback
			connectionCenters.push({
				ingredientId: inNodeId,
				direction: Direction.in,
				flavorName: connection.in.flavorName,
				connectionId: connectionId,
				flavorType: connection.flavorType,
				coords: writable({ x: undefined, y: undefined })
			});
			connectionCenters.push({
				ingredientId: outNodeId,
				direction: Direction.out,
				flavorName: connection.out.flavorName,
				connectionId: connectionId,
				flavorType: connection.flavorType,
				coords: writable({ x: undefined, y: undefined })
			});
		});

		let novelCenters: TerminalCentersState[] = [];
		Object.entries(nodes).forEach(([ingredientId, node]) => {
			Object.entries(node.racks.in).forEach(([flavorName, inRack]) => {
				if (
					!connectionCenters.find((center) => {
						return (
							center.direction == Direction.in &&
							center.flavorName == flavorName &&
							center.ingredientId == ingredientId
						);
					})
				) {
					const novelCenter = {
						ingredientId: ingredientId,
						direction: Direction.in,
						flavorName: flavorName,
						connectionId: null,
						flavorType: inRack.flavorType,
						coords: writable({ x: undefined, y: undefined })
					};
					novelCenters.push(novelCenter);
				}
			});
			Object.entries(node.racks.out).forEach(([flavorName, outRack]) => {
				const novelCenter = {
					ingredientId: ingredientId,
					direction: Direction.out,
					flavorName: flavorName,
					connectionId: null,
					flavorType: outRack.flavorType,
					coords: writable({ x: undefined, y: undefined })
				};
				novelCenters.push(novelCenter);
			});
		});

		return connectionCenters.concat(novelCenters);
	}
);
