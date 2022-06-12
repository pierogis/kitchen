import { derived, writable, type Writable } from 'svelte/store';

import { connections } from '$lib/connections';
import { ingredients } from '$lib/stores';

import { Direction } from '$lib/common/types';

export const terminalHeight = 10;

export type TerminalCenter = {
	flavorUuid: number;
	direction: Direction;
	connectionUuid: number | undefined;
	coords: Writable<{ x: number | undefined; y: number | undefined }>;
};

export const terminalCenters = derived(
	[ingredients, connections],
	([currentIngredients, currentConnections]) => {
		const connectionCenters: TerminalCenter[] = [];

		Object.entries(currentConnections).forEach(([connectionUuid, connection]) => {
			// the context is keyed by ingredientUuid as a string
			// using an object key requires matching the reference
			// maybe pass down through props
			const inFlavorUuid = connection.inFlavorUuid;
			// do the same for out
			const outFlavorUuid = connection.outFlavorUuid;

			// add to the callbacks set for the given connection's "in" parameter name
			// this corresponds to the in (left) terminal on parameters

			// using a store to ultimately notify terminals of a new callback to use when
			// they providing updates on their bounding rect
			// use the out callback
			connectionCenters.push({
				flavorUuid: inFlavorUuid,
				direction: Direction.In,
				connectionUuid: Number(connectionUuid),
				coords: writable({ x: undefined, y: undefined })
			});
			connectionCenters.push({
				flavorUuid: outFlavorUuid,
				direction: Direction.Out,
				connectionUuid: Number(connectionUuid),
				coords: writable({ x: undefined, y: undefined })
			});
		});

		const novelCenters: TerminalCenter[] = [];
		Object.entries(currentIngredients).forEach(([ingredientUuid, ingredient]) => {
			ingredient.flavors.forEach((flavor) => {
				if (
					!connectionCenters.find((center) => {
						return center.direction == Direction.In && center.flavorUuid == flavor.uuid;
					})
				) {
					const novelCenter: TerminalCenter = {
						direction: Direction.In,
						flavorUuid: flavor.uuid,
						connectionUuid: undefined,
						coords: writable({ x: undefined, y: undefined })
					};
					novelCenters.push(novelCenter);
				}
			});
			Object.entries(node.racks.Out).forEach(([flavorName, outRack]) => {
				const novelCenter = {
					direction: Direction.Out,
					connectionUuid: null,
					flavorUuid: flavor.uuid,
					coords: writable({ x: undefined, y: undefined })
				};
				novelCenters.push(novelCenter);
			});
		});

		return connectionCenters.concat(novelCenters);
	}
);
