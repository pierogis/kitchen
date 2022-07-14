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

let renderer: THREE.WebGLRenderer;

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

		if (scene && camera && context) {
			renderer.render(scene, camera);

			context.drawImage(renderer.domElement, 0, 0);
		}
	}

	function onValueChange() {
		update();
	}

	const element = doc.createElement('div');
	element.classList.add(className());
	config.viewProps.bindClassModifiers(element);

	const value = config.value;
	value.emitter.on('change', onValueChange);

	const canvas = doc.createElement('canvas');
	canvas.classList.add(className('canvas'));
	canvas.style.width = '100%';

	element.appendChild(canvas);

	if (!renderer) {
		renderer = new THREE.WebGLRenderer({ antialias: true });
	}

	const context = canvas.getContext('2d');

	update();

	config.viewProps.handleDispose(() => {});

	return { element };
}
