<script lang="ts">
	import { type Terminal, terminalHeight, type ViewState } from '$lib/state/stores/view';

	import TerminalComponent from '$lib/components/Terminal.svelte';
	import { writable } from 'svelte/store';
	import { getContext } from 'svelte';
	import { viewStateContextKey } from '$lib/state';

	export let terminal: Terminal;

	const followCursor = writable(true);

	const viewState: ViewState = getContext(viewStateContextKey);

	function followCursorAction(element: HTMLElement, followCursor: boolean) {
		let cursorUnsub: (() => void) | null = null;

		const follow = () => {
			cursorUnsub = viewState.cursorCoordinates.subscribe((currentCursorCoordinates) => {
				element.style.left = currentCursorCoordinates.x + 'px';
				element.style.top = currentCursorCoordinates.y + 'px';
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

	// params.liveConnection.drop();
</script>

<TerminalComponent
	actionDescriptions={[{ action: followCursorAction, params: $followCursor }]}
	{terminal}
	expanded={true}
	live={true}
	{terminalHeight}
/>
