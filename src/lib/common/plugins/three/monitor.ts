import * as TP from '@tweakpane/core';
import * as THREE from 'three';

import { createPluginController } from './controller';
import type { CanvasValue } from './view';

export interface CanvasMonitorParams extends TP.BaseMonitorParams {
	view: 'three';
}

export const ThreeMonitorPlugin: TP.MonitorBindingPlugin<CanvasValue, CanvasMonitorParams> = {
	id: 'monitor-canvas',
	type: 'monitor',
	accept(exValue: unknown, params: Record<string, unknown>) {
		const object = exValue as CanvasValue;
		if (!object.scene || !object.camera) {
			// return null to deny the user input
			return null;
		}

		const p = TP.ParamsParsers;
		const result = TP.parseParams<CanvasMonitorParams>(params, {
			view: p.required.constant('three')
		});
		if (!result) {
			return null;
		}

		return {
			initialValue: object,
			params: result
		};
	},
	binding: {
		reader(_args) {
			return (exValue: unknown): CanvasValue => {
				const object = exValue as CanvasValue;
				if (!object.scene) {
					object.scene = new THREE.Scene();
				}
				if (!object.camera) {
					object.camera = new THREE.Camera();
				}
				return object;
			};
		}
	},
	controller(args) {
		return createPluginController(args.document, {
			value: args.value,
			viewProps: args.viewProps
		});
	}
};
