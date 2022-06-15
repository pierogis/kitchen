import { derived, writable, type Writable, type Readable } from 'svelte/store';

import { Direction, type Flavor } from '$lib/common/types';
import type { RecipeState } from '$lib/state/stores/recipe';
import type { Node } from '$lib/state/stores/view/nodes';
import type { Cable } from '$lib/state/stores/view/cables';
import type { Coordinates } from '../view';

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
export function createTerminals(flavor: Flavor, cables: Readable<Cable[]>): Readable<Terminal[]> {
	let inTerminalUsed = false;
	const terminals = derived(cables, (currentCables) =>
		currentCables.flatMap((cable) => {
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
		})
	);

	return terminals;
}
