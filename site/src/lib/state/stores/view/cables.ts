import { derived, writable, type Readable, type Writable } from 'svelte/store';

import { Direction, type FlavorType, type Payload } from '@types';

import type { RecipeState } from '@recipe';
import type { Terminal } from '@view';

export interface Cable {
	connectionUuid: string;
	flavorType: FlavorType;
	inFlavorUuid: string | undefined;
	outFlavorUuid: string | undefined;
	payload: Writable<Payload<FlavorType>>;
}

export function createCables(
	recipeState: RecipeState,
	terminals: Readable<Terminal[]>,
	liveTerminal: Readable<Terminal | undefined>
): Readable<Cable[]> {
	const cables: Readable<Cable[]> = derived(
		[terminals, liveTerminal, recipeState.parameters],
		([currentTerminals, currentLiveTerminal, currentParameters]) => {
			// pairing the in and out terminals by connecionUuid
			const terminalPairs: Map<
				string,
				{
					inTerminal: Terminal | undefined;
					outTerminal: Terminal | undefined;
				}
			> = new Map();

			if (currentLiveTerminal) {
				// create a half-filled terminal pair
				const liveTerminalPair = {
					inTerminal:
						currentLiveTerminal.direction == Direction.In ? currentLiveTerminal : undefined,
					outTerminal:
						currentLiveTerminal.direction == Direction.Out ? currentLiveTerminal : undefined
				};

				terminalPairs.set(currentLiveTerminal.connectionUuid, liveTerminalPair);
			}

			currentTerminals.forEach((terminal) => {
				// if a pair has already started for this terminal's connectionUuid
				const currentTerminalPair = terminalPairs.get(terminal.connectionUuid);
				const terminalPair = {
					inTerminal:
						terminal.direction == Direction.In ? terminal : currentTerminalPair?.inTerminal,
					outTerminal:
						terminal.direction == Direction.Out ? terminal : currentTerminalPair?.outTerminal
				};
				terminalPairs.set(terminal.connectionUuid, terminalPair);
			});

			// each terminal pair could lead to a cable if in and out are both present
			const cables: Cable[] = Array.from(terminalPairs.entries()).reduce<Cable[]>(
				(previous, [connectionUuid, terminalPair]) => {
					if (terminalPair.inTerminal && terminalPair.outTerminal) {
						// get the parameter corresponding to the connection's outputting, "source" flavor ->
						const outParameter = Array.from(currentParameters.values()).find(
							(parameter) => parameter.flavorUuid == terminalPair.outTerminal?.flavorUuid
						);

						previous.push({
							connectionUuid: connectionUuid,
							flavorType: terminalPair.outTerminal.flavorType,
							inFlavorUuid: terminalPair.inTerminal.flavorUuid,
							outFlavorUuid: terminalPair.outTerminal.flavorUuid,
							payload: writable({
								type: terminalPair.outTerminal.flavorType,
								params: outParameter?.payload.params
							})
						});
					}
					return previous;
				},
				[]
			);

			return cables;
		}
	);

	return cables;
}
