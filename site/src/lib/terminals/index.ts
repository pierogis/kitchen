import { derived, writable, type Writable } from 'svelte/store';

import { connectionsStore } from '$lib/connections';
import { nodesStore } from '$lib/nodes';

import { Direction } from '$lib/common/types';
import type { FlavorType } from '@prisma/client';

export const terminalHeight = 10;

export type TerminalCentersState = {
	ingredientId: number;
	direction: Direction;
	flavorName: string;
	connectionId: number | null;
	flavorType: FlavorType;
	coords: Writable<{ x: number; y: number }>;
};

export const allNodesTerminalCentersStore = derived(
	[nodesStore, connectionsStore],
	([nodes, connections]) => {
		const connectionCenters: TerminalCentersState[] = [];

		Object.entries(connections).forEach(([connectionId, connection]) => {
			// the context is keyed by ingredientId as a string
			// using an object key requires matching the reference
			// maybe pass down through props
			const inNodeId = connection.in.ingredientId;
			// do the same for out
			const outNodeId = connection.out.ingredientId;

			// add to the callbacks set for the given connection's "in" parameter name
			// this corresponds to the in (left) terminal on parameters

			// using a store to ultimately notify terminals of a new callback to use when
			// they providing updates on their bounding rect
			// use the out callback
			connectionCenters.push({
				ingredientId: inNodeId,
				direction: Direction.In,
				flavorName: connection.in.flavorName,
				connectionId: Number(connectionId),
				flavorType: connection.flavorType,
				coords: writable({ x: undefined, y: undefined })
			});
			connectionCenters.push({
				ingredientId: outNodeId,
				direction: Direction.Out,
				flavorName: connection.out.flavorName,
				connectionId: Number(connectionId),
				flavorType: connection.flavorType,
				coords: writable({ x: undefined, y: undefined })
			});
		});

		const novelCenters: TerminalCentersState[] = [];
		Object.entries(nodes).forEach(([ingredientId, node]) => {
			Object.entries(node.racks.in).forEach(([flavorName, inRack]) => {
				if (
					!connectionCenters.find((center) => {
						return (
							center.direction == Direction.In &&
							center.flavorName == flavorName &&
							center.ingredientId == Number(ingredientId)
						);
					})
				) {
					const novelCenter = {
						ingredientId: Number(ingredientId),
						direction: Direction.In,
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
					ingredientId: Number(ingredientId),
					direction: Direction.Out,
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
