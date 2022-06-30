import { OrthographicCamera, Scene, WebGLRenderer } from 'three';

export function init(canvas: HTMLCanvasElement) {
	var width = canvas.width;
	var height = canvas.height;

	const renderer = new WebGLRenderer({ canvas });
	renderer.setSize(width, height);

	// basic scene setup
	const scene = new Scene();

	const camera = new OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 1000);
	camera.position.z = 2;

	return { renderer, scene, camera };
}
