import { ClassName, type Value, type View, ViewProps, type BufferedValue } from '@tweakpane/core';

import * as THREE from 'three';

interface Config {
	value: Value<THREE.Object3D> | BufferedValue<THREE.Object3D>;
	viewProps: ViewProps;
}

// Create a class name generator from the view name
// ClassName('tmp') will generate a CSS class name like `tp-tmpv`
const className = ClassName('tmp');

// Custom view class should implement `View` interface
export class PluginView implements View {
	public readonly element: HTMLCanvasElement;
	private value: Value<THREE.Object3D> | BufferedValue<THREE.Object3D>;
	private canvasElem: HTMLElement;

	private renderer: THREE.WebGLRenderer;
	private camera: THREE.Camera;

	constructor(doc: Document, config: Config) {
		// Create a root element for the plugin
		this.element = doc.createElement('canvas');
		this.element.classList.add(className());
		// Bind view props to the element
		config.viewProps.bindClassModifiers(this.element);

		// Receive the bound value from the controller
		this.value = config.value;
		// Handle 'change' event of the value
		this.value.emitter.on('change', this.onValueChange_.bind(this));

		// Create child elements
		this.canvasElem = doc.createElement('canvas');
		this.canvasElem.classList.add(className('canvas'));
		this.element.appendChild(this.canvasElem);

		this.renderer = new THREE.WebGLRenderer({ canvas: this.canvasElem });
		this.camera = new THREE.Camera();

		// Apply the initial value
		this.update_();

		config.viewProps.handleDispose(() => {
			// Called when the view is disposing
			console.log('TODO: dispose view');
		});
	}

	private update_(): void {
		const rawValue = this.value.rawValue;

		let geometry: THREE.Object3D | undefined;
		if (rawValue instanceof THREE.Object3D) {
			geometry = rawValue;
		} else {
			geometry = rawValue[0];
		}

		if (geometry) this.renderer.render(geometry, this.camera);
	}

	private onValueChange_() {
		this.update_();
	}
}
