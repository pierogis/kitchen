import { get, writable, type Writable } from 'svelte/store';

import { Direction, type Flavor } from '$lib/common/types';
import type { Cable } from '$lib/state/stores/view/cables';
import type { Coordinates } from '../view';
import { v4 as uuid } from 'uuid';
import type { LiveConnectionState } from './live-connection';

export const terminalHeight = 10;

export type Terminal = {
	flavorUuid: string;
	direction: Direction;
	connectionUuid: string | undefined;
	coordinates: Writable<Coordinates | undefined>;
	cabled: boolean;
};

// terminals
// flavors need to know their terminals
// based on visible cables (via connections) and flavors (terminals not filled by cable)

// does it make sense to make this Map<string, Terminal[]> (key by flavor uuid) or Terminal[]
export function createTerminals(
	flavor: Flavor,
	cables: Cable[],
	liveConnection: LiveConnectionState
): Terminal[] {
	let inTerminalUsed = false;
	const terminals = cables.flatMap((cable) => {
		const terminals = [];
		if (cable.inFlavorUuid == flavor.uuid) {
			inTerminalUsed = true;
			terminals.push({
				flavorUuid: flavor.uuid,
				direction: Direction.In,
				connectionUuid: cable.connectionUuid,
				coordinates: cable.inCoordinates,
				cabled: true
			});
		} else if (cable.outFlavorUuid == flavor.uuid) {
			terminals.push({
				flavorUuid: flavor.uuid,
				direction: Direction.Out,
				connectionUuid: cable.connectionUuid,
				coordinates: cable.outCoordinates,
				cabled: true
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
			coordinates: writable(),
			cabled: false
		});
	}
	terminals.push({
		flavorUuid: flavor.uuid,
		direction: Direction.Out,
		connectionUuid: uuid(),
		coordinates: writable(),
		cabled: false
	});

	// maintain terminal for a disconnected flavor
	const currentLiveConnection = get(liveConnection);
	if (currentLiveConnection && currentLiveConnection.disconnectedFlavorUuid) {
		terminals.push({
			flavorUuid: currentLiveConnection.disconnectedFlavorUuid,
			direction: currentLiveConnection.dragDirection,
			connectionUuid: currentLiveConnection.connectionUuid,
			coordinates: writable(),
			cabled: false
		});
	}

	return terminals;
}
