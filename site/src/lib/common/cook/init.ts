import * as THREE from 'three';

export function init(canvas: HTMLCanvasElement) {
	var width = canvas.width;
	var height = canvas.height;

	const renderer = new THREE.WebGLRenderer({ canvas });
	renderer.setSize(width, height);

	// basic scene setup
	const scene = new THREE.Scene();

	const camera = new THREE.OrthographicCamera(
		width / -2,
		width / 2,
		height / 2,
		height / -2,
		1,
		1000
	);
	camera.position.z = 2;

	return { renderer, scene, camera };
}
