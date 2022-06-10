import { derived, writable, type Readable, type Writable } from 'svelte/store';

import type { Connection } from '$lib/connections';
import type { Flavor } from '$lib/flavors';

let connections: Readable<Connection[]> = writable([]);
let flavors: Readable<Flavor[]> = writable([]);

let asdasd = derived([connections, flavors], ([currentConnections, currentFlavors]) =>
	currentConnections.map((connection) => {
		const inFlavor = currentFlavors.find((flavor) => flavor.id == connection.inFlavorId);
		return {
			inCoords: writable({ x: undefined, y: undefined }),
			outCoords: writable({ x: undefined, y: undefined }),
			parameters: writable(inFlavor?.parameters)
		};
	})
);

export interface Cable {
	inCoords: Writable<{ x: number; y: number }>;
	outCoords: Writable<{ x: number; y: number }>;
	payload: Writable<any>;
}
