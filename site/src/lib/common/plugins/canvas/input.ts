import * as TP from '@tweakpane/core';
import * as THREE from 'three';

import { createPluginController } from './controller';
import type { CanvasValue } from './view';

export interface CanvasInputParams extends TP.BaseInputParams {
	view: 'canvas';
}

export const CanvasInputPlugin: TP.InputBindingPlugin<CanvasValue, CanvasValue, CanvasInputParams> =
	{
		id: 'input-canvas',
		type: 'input',
		css: '__css__',
		accept(exValue: unknown, params: Record<string, unknown>) {
			const object = exValue as CanvasValue;
			if (!object.scene || !object.camera) {
				// return null to deny the user input
				return null;
			}

			const p = TP.ParamsParsers;
			const result = TP.parseParams<CanvasInputParams>(params, {
				view: p.required.constant('canvas')
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
			},

			constraint(_args) {
				const constraints: TP.Constraint<CanvasValue>[] = [];
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
