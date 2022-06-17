<script lang="ts">
	import { type Terminal, terminalHeight, type ViewState } from '$lib/state/stores/view';

	import TerminalComponent from '$lib/components/Terminal.svelte';
	import { get, writable } from 'svelte/store';
	import { getContext } from 'svelte';
	import { viewStateContextKey } from '$lib/state';
	import { checkPointWithinBox } from '$lib/common/utils';

	export let terminal: Terminal;

	const followCursor = writable(true);

	const viewState: ViewState = getContext(viewStateContextKey);

	function followCursorAction(element: HTMLElement, followCursor: boolean) {
		let cursorUnsub: (() => void) | null = null;

		const follow = () => {
			cursorUnsub = viewState.cursorCoordinates.subscribe((currentCursorCoordinates) => {
				if (currentCursorCoordinates) {
					element.style.left = currentCursorCoordinates.x + 'px';
					element.style.top = currentCursorCoordinates.y + 'px';
				}
			});
		};

		if (followCursor) {
			follow();
		}

		return {
			update(newFollowCursor: boolean) {
				if (followCursor != newFollowCursor) {
					if (cursorUnsub) cursorUnsub();
					if (newFollowCursor) {
						follow();
					}
				}
				followCursor = newFollowCursor;
			},
			destroy() {
				if (cursorUnsub) cursorUnsub();
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
				const nearTerminalDistance = 4;

				const targetTerminals: Terminal[] =
					viewState.terminalCoordinates.getMatchingTerminals(terminal);

				let anyConnected = false;

				targetTerminals.forEach((terminal) => {
					// expanding the rect
					const terminalCoordinates = get(
						viewState.terminalCoordinates.getCoordinates(
							terminal.connectionUuid,
							terminal.direction
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
							if (terminal.flavorUuid) {
								liveConnection.connect(
									terminal.flavorUuid,
									terminal.cabled ? terminal.connectionUuid : undefined
								);
								anyConnected = true;
							}
						}
					}
				});
				if (!anyConnected) {
					// const anchorCoordinates = get(
					// 	params.liveConnection.anchorDirection == Direction.In
					// 		? liveCable.inCoordinates
					// 		: liveCable.outCoordinates
					// );
					// if (anchorCoordinates) {
					// 	// set tween controlling position in
					// 	tween.set(anchorCoordinates);
					// }

					liveConnection.drop();
				}
			}
		};

		element.addEventListener('mousedown', handleMouseDown);

		return {
			destroy() {
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
