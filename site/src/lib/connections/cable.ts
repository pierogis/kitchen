import { derived, writable, type Readable, type Writable } from 'svelte/store';

import { connections, flavors, parameters } from '$lib/stores';
import type { FlavorType, Parameter, Payload } from '$lib/common/types';

export const cables: Readable<Cable[]> = derived(
	[connections, flavors, parameters],
	([currentConnections, currentFlavors, currentParameters]) =>
		Array.from(currentConnections.values()).map((connection) => {
			// get the flavor corresponding to the connection's outputting, "source" flavor ->
			const outFlavor = currentFlavors.get(connection.outFlavorUuid);
			if (outFlavor) {
				// get the parameter for this
				const outParameter: Parameter | undefined = Array.from(currentParameters.values()).find(
					(parameter) => parameter.flavorUuid == outFlavor.uuid
				);

				if (outParameter) {
					return {
						connectionUuid: connection.uuid,
						inFlavorUuid: connection.inFlavorUuid,
						outFlavorUuid: connection.outFlavorUuid,
						inCoords: writable({ x: undefined, y: undefined }),
						outCoords: writable({ x: undefined, y: undefined }),
						payload: writable(outParameter.payload)
					};
				} else {
					throw `outParameter for flavor ${outFlavor.uuid} not found`;
				}
			} else {
				throw `outFlavor ${connection.outFlavorUuid} for connection ${connection.uuid} not found`;
			}
		})
);

export interface Cable {
	connectionUuid: string;
	inFlavorUuid: string;
	outFlavorUuid: string;
	inCoords: Writable<{ x: number | undefined; y: number | undefined }>;
	outCoords: Writable<{ x: number | undefined; y: number | undefined }>;
	payload: Writable<Payload<FlavorType>>;
}
