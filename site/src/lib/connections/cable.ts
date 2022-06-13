import { derived, writable, type Readable, type Writable } from 'svelte/store';

import { connections, flavors, parameters } from '$lib/stores';
import { FlavorType } from '@prisma/client';

export const cables: Readable<Cable[]> = derived(
	[connections, flavors, parameters],
	([currentConnections, currentFlavors, currentParameters]) =>
		Array.from(currentConnections.values()).map((connection) => {
			// get the flavor corresponding to the connection's outputting, "source" flavor ->
			const outFlavor = currentFlavors.get(connection.outFlavorUuid);
			if (outFlavor) {
				// get the parameter for this
				const outParameter = Array.from(currentParameters.values()).find(
					(parameter) => parameter.flavorUuid == outFlavor.uuid
				);
				// this method of storing arbitrary parameters in the db is goofy

				// number-type flavor will store number... is key important?
				// only if a single flavor may have multiple parameters
				// so color flavor would not have r g and b input
				// need some js expression type like the shader type GROSs

				let initialPayload: string | number;
				switch (outFlavor.type) {
					case FlavorType.Color:
						initialPayload = outParameter.color;
						break;
					case FlavorType.Image:
						initialPayload = outParameter.image;

						break;
					case FlavorType.Number:
						initialPayload = outParameter.number;
						break;
					case FlavorType.Text:
						initialPayload = outParameter.text;
						break;
				}

				return {
					connectionUuid: connection.uuid,
					inFlavorUuid: connection.inFlavorUuid,
					outFlavorUuid: connection.outFlavorUuid,
					inCoords: writable({ x: undefined, y: undefined }),
					outCoords: writable({ x: undefined, y: undefined }),
					payload: writable(initialPayload)
				};
			} else {
				throw 'Wtf';
			}
		})
);

export interface Cable {
	connectionUuid: string;
	inFlavorUuid: string;
	outFlavorUuid: string;
	inCoords: Writable<{ x: number | undefined; y: number | undefined }>;
	outCoords: Writable<{ x: number | undefined; y: number | undefined }>;
	payload: Writable<string | number>;
}
