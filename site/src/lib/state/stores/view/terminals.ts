import { derived, get, writable, type Readable, type Writable } from 'svelte/store';
import { v4 as uuid } from 'uuid';

import { Direction, FlavorType, type Flavor } from '$lib/common/types';

import type { Coordinates } from '.';
import type { Cable } from './cables';
import type { LiveConnection, LiveConnectionState } from './liveConnection';

export const terminalHeight = 10;

export type Terminal = {
	flavorUuid?: string;
	direction: Direction;
	connectionUuid: string;
	coordinates: Writable<Coordinates | undefined>;
	cabled: boolean;
	flavorType: FlavorType;
};

// terminals
// flavors need to know their terminals
// based on visible cables (via connections) and flavors (terminals not filled by cable)

// does it make sense to make this Map<string, Terminal[]> (key by flavor uuid) or Terminal[]
export function createTerminals(
	flavor: Flavor,
	cables: Readable<Cable[]>,
	liveConnection: LiveConnectionState
): Readable<Terminal[]> {
	const novelInCoordinates = writable(undefined);
	const novelOutCoordinates = writable(undefined);
	const disconnectedCoords = writable(undefined);

	const terminals = derived([cables, liveConnection], ([currentCables, currentLiveConnection]) => {
		let inTerminalUsed = false;
		const terminals: Terminal[] = currentCables.flatMap((cable) => {
			const terminals = [];
			if (cable.inFlavorUuid == flavor.uuid) {
				inTerminalUsed = true;
				terminals.push({
					flavorUuid: flavor.uuid,
					direction: Direction.In,
					connectionUuid: cable.connectionUuid,
					coordinates: cable.inCoordinates,
					cabled: true,
					flavorType: flavor.type
				});
			} else if (cable.outFlavorUuid == flavor.uuid) {
				terminals.push({
					flavorUuid: flavor.uuid,
					direction: Direction.Out,
					connectionUuid: cable.connectionUuid,
					coordinates: cable.outCoordinates,
					cabled: true,
					flavorType: flavor.type
				});
			}

			return terminals;
		});

		// creating novel terminals
		if (!inTerminalUsed) {
			terminals.push({
				flavorUuid: flavor.uuid,
				direction: Direction.In,
				connectionUuid: uuid(),
				coordinates: novelInCoordinates,
				cabled: false,
				flavorType: flavor.type
			});
		}
		terminals.push({
			flavorUuid: flavor.uuid,
			direction: Direction.Out,
			connectionUuid: uuid(),
			coordinates: novelOutCoordinates,
			cabled: false,
			flavorType: flavor.type
		});

		// maintain terminal for a disconnected flavor
		if (currentLiveConnection && currentLiveConnection.disconnectedFlavorUuid) {
			terminals.push({
				flavorUuid: currentLiveConnection.disconnectedFlavorUuid,
				direction: currentLiveConnection.dragDirection,
				connectionUuid: currentLiveConnection.connectionUuid,
				coordinates: disconnectedCoords,
				cabled: false,
				flavorType: currentLiveConnection.flavorType
			});
		}

		return terminals;
	});
	return {
		subscribe: terminals.subscribe
	};
}
