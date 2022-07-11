import * as THREE from 'three';

export function init(canvas: HTMLCanvasElement) {
	const width = canvas.width;
	const height = canvas.height;

	const renderer = new THREE.WebGLRenderer({ canvas });
	renderer.setSize(width, height);

	// basic scene setup
	const scene = new THREE.Scene();

	const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
	camera.position.z = 2;

	return { renderer, scene, camera };
}
