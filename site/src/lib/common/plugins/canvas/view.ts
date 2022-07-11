import * as TP from '@tweakpane/core';

import * as THREE from 'three';

export interface CanvasValue {
	scene: THREE.Scene;
	camera: THREE.Camera;
}

interface Config {
	value: TP.Value<CanvasValue> | TP.BufferedValue<CanvasValue>;
	viewProps: TP.ViewProps;
}

const className = TP.ClassName('geo');

export function createPluginView(doc: Document, config: Config): TP.View {
	function update(): void {
		const coerced = value.rawValue as CanvasValue;

		let scene: THREE.Scene | undefined;
		let camera: THREE.Camera | undefined;

		if (coerced.scene && coerced.camera) {
			({ scene, camera } = coerced);
		} else {
			const buffer = value.rawValue as TP.Buffer<CanvasValue>;
			scene = buffer[0]?.scene;
			camera = buffer[0]?.camera;
		}

		if (scene && camera) {
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

	const aspect = canvas.width / canvas.height;

	const renderer = new THREE.WebGLRenderer({ canvas });
	// camera.position.z = 2;

	// Apply the initial value
	update();

	config.viewProps.handleDispose(() => {
		renderer.dispose();
	});

	return { element };
}
