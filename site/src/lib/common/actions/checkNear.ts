import { checkPointWithinBox } from '../utils';

export function checkNearAction(element: HTMLElement, nearDistance: number) {
	let near = false;

	let checkNear = (event: MouseEvent) => {
		let rect = element.getBoundingClientRect();

		// expanding the rect
		let left = rect.left - nearDistance;
		let top = rect.top - nearDistance;
		let right = rect.right + nearDistance;
		let bottom = rect.bottom + nearDistance;

		near = checkPointWithinBox(
			{ x: event.pageX, y: event.pageY },
			{ top: top, bottom: bottom, left: left, right: right }
		);
		element.dispatchEvent(new CustomEvent('near', { detail: near }));
	};

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
