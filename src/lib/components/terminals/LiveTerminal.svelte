<script lang="ts">
	import { getContext } from 'svelte';
	import { get, type Readable } from 'svelte/store';

	import type { Coordinates } from '$types';
	import { type Terminal, terminalHeight, type ViewState, viewStateContextKey } from '$view';

	import { checkPointWithinBox } from '$lib/common/utils';

	import TerminalComponent from './Terminal.svelte';
	import { tweened } from 'svelte/motion';

	export let terminal: Terminal;

	const viewState: ViewState = getContext(viewStateContextKey);

	let followCoordinates: Readable<Coordinates> = viewState.cursor.coordinates;
	let tweenDuration = 50;

	const tweenedFollowCoordinates = tweened(get(followCoordinates), {
		duration: tweenDuration
	});

	function followCoordinatesAction(element: HTMLElement, followCoordinates: Readable<Coordinates>) {
		let inputCoordinatesUnsub: (() => void) | null = null;
		let tweenedUnsub: (() => void) | null = null;

		inputCoordinatesUnsub = followCoordinates.subscribe((currentCursorCoordinates) => {
			if (currentCursorCoordinates) {
				tweenedFollowCoordinates.set(currentCursorCoordinates, { duration: tweenDuration });
			}
		});

		tweenedUnsub = tweenedFollowCoordinates.subscribe((currentTweenedCursorCoordinates) => {
			element.style.left = currentTweenedCursorCoordinates.x + 'px';
			element.style.top = currentTweenedCursorCoordinates.y + 'px';
		});

		return {
			update(newFollowCoordinates: Readable<Coordinates | undefined>) {
				if (inputCoordinatesUnsub) inputCoordinatesUnsub();

				inputCoordinatesUnsub = newFollowCoordinates.subscribe((currentCursorCoordinates) => {
					if (currentCursorCoordinates) {
						tweenedFollowCoordinates.set(currentCursorCoordinates, {
							duration: tweenDuration
						});
					}
				});
			},
			destroy() {
				if (inputCoordinatesUnsub) inputCoordinatesUnsub();
				if (tweenedUnsub) tweenedUnsub();
			}
		};
	}

	function dropTerminalAction(element: HTMLElement) {
		let handleMouseDown = (event: MouseEvent) => {
			// ensure left click and liveConnection active
			const liveConnection = get(viewState.liveConnection);
			if (event.button == 0 && liveConnection) {
				element.style.cursor = '';
				// for live terminal
				const nearTerminalDistance = 10;

				const targetTerminals: Terminal[] =
					viewState.terminalsCoordinates.getMatchingTerminals(terminal);

				let anyConnected = false;

				for (const targetTerminal of targetTerminals) {
					if (
						targetTerminal.flavorUuid != liveConnection.anchorFlavorUuid ||
						(liveConnection.anchorUsageUuid == undefined && targetTerminal.usageUuid == undefined)
					) {
						// expanding the rect
						const terminalCoordinates = get(
							viewState.terminalsCoordinates.getCoordinates(
								targetTerminal.connectionUuid,
								targetTerminal.direction
							)
						);

						if (terminalCoordinates) {
							const left = terminalCoordinates.x - (terminalHeight / 2 + nearTerminalDistance);
							const top = terminalCoordinates.y - (terminalHeight / 2 + nearTerminalDistance);
							const right = terminalCoordinates.x + (terminalHeight / 2 + nearTerminalDistance);
							const bottom = terminalCoordinates.y + (terminalHeight / 2 + nearTerminalDistance);

							if (
								checkPointWithinBox(
									{ x: event.clientX, y: event.clientY },
									{ top: top, bottom: bottom, left: left, right: right }
								)
							) {
								if (targetTerminal.flavorUuid) {
									liveConnection.connect(
										targetTerminal.flavorUuid,
										targetTerminal.usageUuid,
										targetTerminal.cabled ? targetTerminal.connectionUuid : undefined
									);
									anyConnected = true;
									break;
								}
							}
						}
					}
				}
				if (!anyConnected) {
					followCoordinates = viewState.terminalsCoordinates.getCoordinates(
						liveConnection.connectionUuid,
						liveConnection.anchorDirection
					);
					tweenDuration = 300;

					setTimeout(() => {
						liveConnection.drop();
					}, tweenDuration * 2);
				}
			}
		};

		element.addEventListener('mousedown', handleMouseDown);

		return {
			destroy: () => {
				element.removeEventListener('mousedown', handleMouseDown);
			}
		};
	}
</script>

<TerminalComponent
	actionDescriptions={[
		{
			action: followCoordinatesAction,
			params: followCoordinates
		},
		{ action: dropTerminalAction }
	]}
	{terminal}
	expanded={true}
	live={true}
	{terminalHeight}
/>
