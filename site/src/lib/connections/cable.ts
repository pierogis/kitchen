import { derived, writable, type Readable, type Writable } from 'svelte/store';

import { connections, flavors, parameters } from '$lib/stores';

export const cables: Readable<Cable[]> = derived(
	[connections, flavors, parameters],
	([currentConnections, currentFlavors, currentParameters]) =>
		Array.from(currentConnections.values()).map((connection) => {
			const outFlavor = currentFlavors.get(connection.inFlavorUuid);
			const outParameter = Array.from(currentParameters.values()).find(
				(parameter) => parameter.flavorUuid == outFlavor?.uuid
			);
			return {
				inCoords: writable({ x: undefined, y: undefined }),
				outCoords: writable({ x: undefined, y: undefined }),
				payload: writable(outParameter?.payload)
			};
		})
);

export interface Cable {
	inCoords: Writable<{ x: number | undefined; y: number | undefined }>;
	outCoords: Writable<{ x: number | undefined; y: number | undefined }>;
	payload: Writable<any>;
}
