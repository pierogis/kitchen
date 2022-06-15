import { writable, type Writable } from 'svelte/store';

import { Direction, type Flavor } from '$lib/common/types';
import type { Cable } from '$lib/state/stores/view/cables';
import type { Coordinates } from '../view';
import { v4 as uuid } from 'uuid';

export const terminalHeight = 10;

export type Terminal = {
	flavorUuid: string;
	direction: Direction;
	connectionUuid: string | undefined;
	coordinates: Writable<Coordinates | undefined>;
};

// terminals
// flavors need to know their terminals
// based on visible cables (via connections) and flavors (terminals not filled by cable)

// does it make sense to make this Map<string, Terminal[]> (key by flavor uuid) or Terminal[]
export function createTerminals(flavor: Flavor, cables: Cable[]): Terminal[] {
	let inTerminalUsed = false;
	const terminals = cables.flatMap((cable) => {
		const terminals = [];
		if (cable.inFlavorUuid == flavor.uuid) {
			inTerminalUsed = true;
			terminals.push({
				flavorUuid: flavor.uuid,
				direction: Direction.In,
				connectionUuid: cable.connectionUuid,
				coordinates: cable.inCoordinates
			});
		} else {
			terminals.push({
				flavorUuid: flavor.uuid,
				direction: Direction.Out,
				connectionUuid: cable.connectionUuid,
				coordinates: cable.outCoordinates
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
			coordinates: writable()
		});
	}
	terminals.push({
		flavorUuid: flavor.uuid,
		direction: Direction.Out,
		connectionUuid: uuid(),
		coordinates: writable()
	});

	return terminals;
}
