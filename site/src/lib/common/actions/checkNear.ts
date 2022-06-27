import { checkPointWithinBox } from '../utils';

export function checkNearAction(element: HTMLElement, nearDistance: number) {
	let near = false;

	function checkNear(event: MouseEvent) {
		const rect = element.getBoundingClientRect();

		// expanding the rect
		const left = rect.left - nearDistance;
		const top = rect.top - nearDistance;
		const right = rect.right + nearDistance;
		const bottom = rect.bottom + nearDistance;

		near = checkPointWithinBox(
			{ x: event.pageX, y: event.pageY },
			{ top: top, bottom: bottom, left: left, right: right }
		);
		element.dispatchEvent(new CustomEvent('near', { detail: near }));
	}

	window.addEventListener('mousemove', checkNear);

	return {
		update(newNearDistance: number) {
			nearDistance = newNearDistance;
		},
		destroy() {
			window.removeEventListener('mousemove', checkNear);
		}
	};
}
