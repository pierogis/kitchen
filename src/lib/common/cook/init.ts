import type { ViewState } from '$view';
import * as THREE from 'three';

export function init(viewState: ViewState, canvas: HTMLCanvasElement) {
	const renderer = new THREE.WebGLRenderer({ antialias: true });

	const initialWidth = canvas.width;
	const initialHeight = canvas.height;

	// basic scene setup
	const scene = new THREE.Scene();

	function setSize(width: number, height: number) {
		renderer.setSize(width, height);
	}

	viewState.windowSize.subscribe(($windowSize) => {
		setSize($windowSize?.width || initialWidth, $windowSize?.height || initialHeight);
	});

	const context = canvas.getContext('2d');
	if (!context) throw `couldn't get 2d context`;

	return { renderer, scene, context };
}
