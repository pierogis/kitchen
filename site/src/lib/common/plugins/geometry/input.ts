import {
	type BaseInputParams,
	BindingTarget,
	CompositeConstraint,
	type InputBindingPlugin,
	ParamsParsers,
	parseParams,
	type Constraint
} from '@tweakpane/core';
import * as THREE from 'three';

import { PluginController } from './controller';

export interface PluginInputParams extends BaseInputParams {
	view: 'geometry';
}

// NOTE: You can see JSDoc comments of `InputBindingPlugin` for details about each property
//
// `InputBindingPlugin<In, Ex, P>` means...
// - The plugin receives the bound value as `Ex`,
// - converts `Ex` into `In` and holds it
// - P is the type of the parsed parameters
//
export const GeometryInputPlugin: InputBindingPlugin<
	THREE.Object3D,
	THREE.Object3D,
	PluginInputParams
> = {
	id: 'geometry',

	// type: The plugin type.
	// - 'input': Input binding
	// - 'monitor': Monitor binding
	type: 'input',

	// This plugin template injects a compiled CSS by @rollup/plugin-replace
	// See rollup.config.js for details
	css: '__css__',

	accept(exValue: unknown, params: Record<string, unknown>) {
		if (!(exValue instanceof THREE.Object3D)) {
			// Return null to deny the user input
			return null;
		}

		// Parse parameters object
		const p = ParamsParsers;
		const result = parseParams<PluginInputParams>(params, {
			// `view` option may be useful to provide a custom control for primitive values
			view: p.required.constant('geometry')
		});
		if (!result) {
			return null;
		}

		// Return a typed value and params to accept the user input
		return {
			initialValue: exValue,
			params: result
		};
	},

	binding: {
		reader(_args) {
			return (exValue: unknown): THREE.Object3D => {
				// Convert an external unknown value into the internal value
				return exValue instanceof THREE.Object3D ? exValue : new THREE.Object3D();
			};
		},

		constraint(_args) {
			// Create a value constraint from the user input
			const constraints: Constraint<THREE.Object3D>[] = [];
			// Use `CompositeConstraint` to combine multiple constraints
			return new CompositeConstraint(constraints);
		},

		writer(_args) {
			return (target: BindingTarget, inValue) => {
				// Use `target.write()` to write the primitive value to the target,
				// or `target.writeProperty()` to write a property of the target
				target.write(inValue);
			};
		}
	},

	controller(args) {
		// Create a controller for the plugin
		return new PluginController(args.document, {
			value: args.value,
			viewProps: args.viewProps
		});
	}
};
