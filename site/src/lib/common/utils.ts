export function calculateCenter(rect: DOMRect): { x: number; y: number } {
	let x = rect.x + rect.width / 2;
	let y = rect.y + rect.height / 2;

	return { x, y };
}

export function checkPointWithinBox(
	point: { x: number; y: number },
	box: { top: number; bottom: number; left: number; right: number }
) {
	// if x within width and y within height, point is within
	if (point.x > box.left && point.x < box.right && point.y > box.top && point.y < box.bottom) {
		return true;
	} else {
		return false;
	}
}
