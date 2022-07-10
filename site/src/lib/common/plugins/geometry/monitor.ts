import * as TP from '@tweakpane/core';
import * as THREE from 'three';

import { createPluginController } from './controller';

export interface GeometryMonitorParams extends TP.BaseMonitorParams {
	view: 'geometry';
}

export const GeometryMonitorPlugin: TP.MonitorBindingPlugin<
	THREE.BufferGeometry,
	GeometryMonitorParams
> = {
	id: 'monitor-geometry',
	type: 'monitor',
	css: '__css__',
	accept(exValue: unknown, params: Record<string, unknown>) {
		const object = exValue as THREE.BufferGeometry;
		if (!object.isBufferGeometry) {
			// return null to deny the user input
			return null;
		}

		const p = TP.ParamsParsers;
		const result = TP.parseParams<GeometryMonitorParams>(params, {
			view: p.required.constant('geometry')
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
			return (exValue: unknown): THREE.BufferGeometry => {
				let object = exValue as THREE.BufferGeometry;
				if (!object.isBufferGeometry) {
					object = new THREE.BufferGeometry();
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
