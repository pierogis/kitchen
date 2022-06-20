<script lang="ts">
	import { getContext } from 'svelte';
	import { get, writable } from 'svelte/store';

	import { type Terminal, terminalHeight, type ViewState } from '@view';
	import { viewStateContextKey } from '@state';
	import { checkPointWithinBox } from '$lib/common/utils';

	import TerminalComponent from '@components/Terminal.svelte';
	import { tweened } from 'svelte/motion';

	export let terminal: Terminal;

	const followCursor = writable(true);

	const viewState: ViewState = getContext(viewStateContextKey);

	function followCursorAction(element: HTMLElement, followCursor: boolean) {
		let cursorUnsub: (() => void) | null = null;
		let tweenedUnsub: (() => void) | null = null;

		const follow = () => {
			const tweenedCursorCoordinates = tweened(get(viewState.cursorCoordinates), { duration: 100 });
			cursorUnsub = viewState.cursorCoordinates.subscribe((currentCursorCoordinates) => {
				if (currentCursorCoordinates) {
					tweenedCursorCoordinates.set(currentCursorCoordinates);
				}
			});

			tweenedUnsub = tweenedCursorCoordinates.subscribe((currentTweenedCursorCoordinates) => {
				element.style.left = currentTweenedCursorCoordinates.x + 'px';
				element.style.top = currentTweenedCursorCoordinates.y + 'px';
			});
		};

		if (followCursor) {
			follow();
		}

		return {
			update(newFollowCursor: boolean) {
				if (followCursor != newFollowCursor) {
					if (cursorUnsub) cursorUnsub();
					if (tweenedUnsub) tweenedUnsub();
					if (newFollowCursor) {
						follow();
					}
				}
				followCursor = newFollowCursor;
			},
			destroy() {
				if (cursorUnsub) cursorUnsub();
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
				const nearTerminalDistance = 20;

				const targetTerminals: Terminal[] =
					viewState.terminalsCoordinates.getMatchingTerminals(terminal);

				let anyConnected = false;

				for (const targetTerminal of targetTerminals) {
					// expanding the rect
					const terminalsCoordinates = get(
						viewState.terminalsCoordinates.getCoordinates(
							targetTerminal.connectionUuid,
							targetTerminal.direction
						)
					);

					if (terminalsCoordinates) {
						const left = terminalsCoordinates.x - (terminalHeight / 2 + nearTerminalDistance);
						const top = terminalsCoordinates.y - (terminalHeight / 2 + nearTerminalDistance);
						const right = terminalsCoordinates.x + (terminalHeight / 2 + nearTerminalDistance);
						const bottom = terminalsCoordinates.y + (terminalHeight / 2 + nearTerminalDistance);

						if (
							checkPointWithinBox(
								{ x: event.clientX, y: event.clientY },
								{ top: top, bottom: bottom, left: left, right: right }
							)
						) {
							if (targetTerminal.flavorUuid) {
								liveConnection.connect(
									targetTerminal.flavorUuid,
									targetTerminal.cabled ? targetTerminal.connectionUuid : undefined
								);
								anyConnected = true;
								break;
							}
						}
					}
				}
				if (!anyConnected) {
					liveConnection.drop();
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
		{ action: followCursorAction, params: $followCursor },
		{ action: dropTerminalAction }
	]}
	{terminal}
	expanded={true}
	live={true}
	{terminalHeight}
/>
