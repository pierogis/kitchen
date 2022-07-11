import * as TP from '@tweakpane/core';

import * as THREE from 'three';

interface Config {
	value: TP.Value<THREE.BufferGeometry> | TP.BufferedValue<THREE.BufferGeometry>;
	viewProps: TP.ViewProps;
}

// Create a class name generator from the view name
// ClassName('tmp') will generate a CSS class name like `tp-tmpv`
const className = TP.ClassName('geo');

export function createPluginView(doc: Document, config: Config): TP.View {
	function update(): void {
		const rawValue = value.rawValue;

		let geometry: THREE.BufferGeometry | undefined;
		if (rawValue instanceof THREE.BufferGeometry) {
			geometry = rawValue;
		} else {
			geometry = rawValue[0];
		}

		if (geometry) {
			scene.clear();
			scene.add(new THREE.Mesh(geometry));
			renderer.render(scene, camera);
		}
	}

	function onValueChange() {
		update();
	}

	// Create a root element for the plugin
	const element = doc.createElement('div');
	element.classList.add(className());
	// Bind view props to the element
	config.viewProps.bindClassModifiers(element);

	// Receive the bound value from the controller
	const value = config.value;
	// Handle 'change' event of the value
	value.emitter.on('change', onValueChange);

	// Create child elements
	const canvas = doc.createElement('canvas');
	canvas.classList.add(className('canvas'));
	canvas.style.width = '100%';

	element.appendChild(canvas);

	const width = canvas.width;
	const height = canvas.height;

	const renderer = new THREE.WebGLRenderer({ canvas });
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
	camera.position.z = 2;

	// Apply the initial value
	update();

	config.viewProps.handleDispose(() => {
		renderer.dispose();
	});

	return { element };
}
