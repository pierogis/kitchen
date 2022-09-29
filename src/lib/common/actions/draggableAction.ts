export function draggableAction(handle: HTMLElement, dragTarget?: HTMLElement) {
	let pos1 = 0,
		pos2 = 0,
		pos3 = 0,
		pos4 = 0;

	handle.addEventListener('mousedown', handleMouseDown);
	handle.addEventListener('touchstart', handleTouchStart);

	let element = dragTarget || handle;

	function handleMouseDown(event: MouseEvent) {
		if (event.button == 0) {
			event.preventDefault();
			event.stopPropagation();
			// get the mouse cursor position at start
			pos3 = event.clientX;
			pos4 = event.clientY;
			document.addEventListener('mouseup', handleMouseUp);
			// call a function whenever the cursor moves
			document.addEventListener('mousemove', handleMouseMove);
			handle.style.cursor = 'grabbing';
		}
	}
	function handleTouchStart(event: TouchEvent) {
		const touch = event.targetTouches[0];
		if (touch) {
			event.preventDefault();
			event.stopPropagation();
			// get the touch position at start
			pos3 = touch.clientX;
			pos4 = touch.clientY;
			document.addEventListener('touchend', handleTouchEnd);
			// call a function whenever the cursor moves
			document.addEventListener('touchmove', handleTouchMove);
			handle.style.cursor = 'grabbing';
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

	function handleTouchMove(event: TouchEvent) {
		const touch = event.targetTouches[0];
		if (touch) {
			event.preventDefault();
			// calculate the new cursor position
			pos1 = pos3 - touch.clientX;
			pos2 = pos4 - touch.clientY;
			pos3 = touch.clientX;
			pos4 = touch.clientY;
			// set the element's new position
			const top = element.offsetTop - pos2;
			const left = element.offsetLeft - pos1;
			element.style.top = top + 'px';
			element.style.left = left + 'px';
		}
	}

	function handleMouseUp(event: MouseEvent) {
		// stop moving when mouse button is released:
		handle.style.cursor = '';
		handle.dispatchEvent(
			new CustomEvent('release', {
				detail: { x: event.clientX, y: event.clientY }
			})
		);
		document.removeEventListener('mouseup', handleMouseUp);
		document.removeEventListener('mousemove', handleMouseMove);
	}

	function handleTouchEnd(_event: TouchEvent) {
		// stop moving when touch is released:
		handle.style.cursor = '';
		handle.dispatchEvent(
			new CustomEvent('release', {
				detail: { x: pos3, y: pos4 }
			})
		);
		document.removeEventListener('touchend', handleTouchEnd);
		document.removeEventListener('touchmove', handleTouchMove);
	}

	return {
		update(newDragTarget?: HTMLElement) {
			handle.removeEventListener('mousedown', handleMouseDown);
			handle.removeEventListener('touchstart', handleTouchStart);

			element = newDragTarget || handle;

			handle.addEventListener('mousedown', handleMouseDown);
			handle.addEventListener('touchstart', handleTouchStart);
		},
		destroy() {
			handle.removeEventListener('mousedown', handleMouseDown);
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);

			handle.removeEventListener('touchstart', handleTouchStart);
			document.removeEventListener('touchmove', handleTouchMove);
			document.removeEventListener('touchend', handleTouchEnd);
		}
	};
}
