export function draggableAction(element: HTMLElement, handle?: HTMLElement) {
	let pos1 = 0,
		pos2 = 0,
		pos3 = 0,
		pos4 = 0;

	let grabTarget: HTMLElement;

	if (handle) {
		grabTarget = handle;
	} else {
		grabTarget = element;
	}

	grabTarget.addEventListener('mousedown', dragMouseDown);

	// for dragging the node
	function dragMouseDown(event: MouseEvent) {
		if (event.button == 0) {
			event.preventDefault();
			event.stopPropagation();
			// get the mouse cursor position at startup
			pos3 = event.clientX;
			pos4 = event.clientY;
			document.addEventListener('mouseup', stopDragElement);
			// call a function whenever the cursor moves
			document.addEventListener('mousemove', handleMouseMove);
			grabTarget.style.cursor = 'grabbing';
		}
	}

	function handleMouseMove(event: MouseEvent) {
		event.preventDefault();
		// calculate the new cursor position
		pos1 = pos3 - event.clientX;
		pos2 = pos4 - event.clientY;
		pos3 = event.clientX;
		pos4 = event.clientY;
		// set the element's new position
		const top = element.offsetTop - pos2;
		const left = element.offsetLeft - pos1;
		element.style.top = top + 'px';
		element.style.left = left + 'px';
	}

	function stopDragElement(event: MouseEvent) {
		// stop moving when mouse button is released:
		grabTarget.style.cursor = '';
		element.dispatchEvent(
			new CustomEvent('release', {
				detail: { x: event.clientX, y: event.clientY }
			})
		);
		document.removeEventListener('mouseup', stopDragElement);
		document.removeEventListener('mousemove', handleMouseMove);
	}

	return {
		update(newHandle?: HTMLElement) {
			grabTarget.removeEventListener('mousedown', dragMouseDown);

			if (newHandle) {
				grabTarget = newHandle;
			} else {
				grabTarget = element;
			}

			grabTarget.addEventListener('mousedown', dragMouseDown);
		},
		destroy() {
			grabTarget.removeEventListener('mousedown', dragMouseDown);
			document.removeEventListener('mouseup', stopDragElement);
			document.removeEventListener('mousemove', handleMouseMove);
		}
	};
}
