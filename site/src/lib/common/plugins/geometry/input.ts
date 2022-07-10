import * as TP from '@tweakpane/core';
import * as THREE from 'three';

import { createPluginController } from './controller';

export interface GeometryInputParams extends TP.BaseInputParams {
	view: 'geometry';
}

export const GeometryInputPlugin: TP.InputBindingPlugin<
	THREE.BufferGeometry,
	THREE.BufferGeometry,
	GeometryInputParams
> = {
	id: 'input-geometry',
	type: 'input',
	css: '__css__',
	accept(exValue: unknown, params: Record<string, unknown>) {
		const object = exValue as THREE.BufferGeometry;
		if (!object?.isBufferGeometry) {
			// return null to deny the user input
			return null;
		}

		const p = TP.ParamsParsers;
		const result = TP.parseParams<GeometryInputParams>(params, {
			view: p.required.constant('geometry')
		});
		if (!result) {
			return null;
		}

		// return typed value and params to accept user input
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
		},

		constraint(_args) {
			const constraints: TP.Constraint<THREE.BufferGeometry>[] = [];
			return new TP.CompositeConstraint(constraints);
		},

		writer(_args) {
			return (target: TP.BindingTarget, inValue) => {
				target.write(inValue);
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
