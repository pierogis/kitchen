import { derived, writable, type Readable, type Writable } from 'svelte/store';

import { Direction, type FlavorType, type Payload } from '$lib/common/types';

import type { RecipeState } from '$lib/state/stores/recipe';
import type { Terminal } from '.';

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
			const terminalPairs: Map<
				string,
				{
					inTerminal: Terminal | undefined;
					outTerminal: Terminal | undefined;
				}
			> = new Map();

			console.log(currentTerminals);

			currentTerminals.forEach((terminal) => {
				const terminalPair = {
					inTerminal:
						terminal.direction == Direction.In
							? terminal
							: terminalPairs.get(terminal.connectionUuid)?.inTerminal,
					outTerminal:
						terminal.direction == Direction.Out
							? terminal
							: terminalPairs.get(terminal.connectionUuid)?.outTerminal
				};
				terminalPairs.set(terminal.connectionUuid, terminalPair);
			});

			if (currentLiveTerminal) {
				// update the half-filled connection
				const liveTerminalPair = {
					inTerminal:
						currentLiveTerminal.direction == Direction.In
							? currentLiveTerminal
							: terminalPairs.get(currentLiveTerminal.connectionUuid)?.inTerminal,
					outTerminal:
						currentLiveTerminal.direction == Direction.Out
							? currentLiveTerminal
							: terminalPairs.get(currentLiveTerminal.connectionUuid)?.outTerminal
				};

				terminalPairs.set(currentLiveTerminal.connectionUuid, liveTerminalPair);
			}

			const cables: Cable[] = Array.from(terminalPairs.entries()).flatMap(
				([connectionUuid, terminalPair]) => {
					if (terminalPair.inTerminal && terminalPair.outTerminal) {
						// get the parameter corresponding to the connection's outputting, "source" flavor ->
						const outParameter = Array.from(currentParameters.values()).find(
							(parameter) => parameter.flavorUuid == terminalPair.outTerminal?.flavorUuid
						);

						return [
							{
								connectionUuid: connectionUuid,
								flavorType: terminalPair.outTerminal.flavorType,
								inFlavorUuid: terminalPair.inTerminal.flavorUuid,
								outFlavorUuid: terminalPair.outTerminal.flavorUuid,
								payload: writable({
									type: terminalPair.outTerminal.flavorType,
									params: outParameter?.payload?.params
								})
							}
						];
					} else {
						return [];
					}
				}
			);

			return cables;
		}
	);

	return cables;
}
