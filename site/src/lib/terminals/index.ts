import { derived, writable, type Writable } from 'svelte/store';

import { connections } from '$lib/connections';
import { ingredients } from '$lib/stores';

import { Direction } from '$lib/common/types';

export const terminalHeight = 10;

export type TerminalCenter = {
	flavorId: number;
	direction: Direction;
	connectionId: number | undefined;
	coords: Writable<{ x: number | undefined; y: number | undefined }>;
};

export const terminalCenters = derived(
	[ingredients, connections],
	([currentIngredients, currentConnections]) => {
		const connectionCenters: TerminalCenter[] = [];

		Object.entries(currentConnections).forEach(([connectionId, connection]) => {
			// the context is keyed by ingredientId as a string
			// using an object key requires matching the reference
			// maybe pass down through props
			const inFlavorId = connection.inFlavorId;
			// do the same for out
			const outFlavorId = connection.outFlavorId;

			// add to the callbacks set for the given connection's "in" parameter name
			// this corresponds to the in (left) terminal on parameters

			// using a store to ultimately notify terminals of a new callback to use when
			// they providing updates on their bounding rect
			// use the out callback
			connectionCenters.push({
				flavorId: inFlavorId,
				direction: Direction.In,
				connectionId: Number(connectionId),
				coords: writable({ x: undefined, y: undefined })
			});
			connectionCenters.push({
				flavorId: outFlavorId,
				direction: Direction.Out,
				connectionId: Number(connectionId),
				coords: writable({ x: undefined, y: undefined })
			});
		});

		const novelCenters: TerminalCenter[] = [];
		Object.entries(currentIngredients).forEach(([ingredientId, ingredient]) => {
			ingredient.flavors.forEach((flavor) => {
				if (
					!connectionCenters.find((center) => {
						return center.direction == Direction.In && center.flavorId == flavor.id;
					})
				) {
					const novelCenter: TerminalCenter = {
						direction: Direction.In,
						flavorId: flavor.id,
						connectionId: undefined,
						coords: writable({ x: undefined, y: undefined })
					};
					novelCenters.push(novelCenter);
				}
			});
			Object.entries(node.racks.Out).forEach(([flavorName, outRack]) => {
				const novelCenter = {
					direction: Direction.Out,
					connectionId: null,
					flavorId: flavor.id,
					coords: writable({ x: undefined, y: undefined })
				};
				novelCenters.push(novelCenter);
			});
		});

		return connectionCenters.concat(novelCenters);
	}
);
