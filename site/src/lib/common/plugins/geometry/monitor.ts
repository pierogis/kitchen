import {
	ParamsParsers,
	parseParams,
	type MonitorBindingPlugin,
	type BaseMonitorParams
} from '@tweakpane/core';
import * as THREE from 'three';

import { PluginController } from './controller';

export interface PluginMonitorParams extends BaseMonitorParams {
	view: 'geometry';
}

// NOTE: You can see JSDoc comments of `InputBindingPlugin` for details about each property
//
// `InputBindingPlugin<In, Ex, P>` means...
// - The plugin receives the bound value as `Ex`,
// - converts `Ex` into `In` and holds it
// - P is the type of the parsed parameters
//
export const GeometryMonitorPlugin: MonitorBindingPlugin<THREE.Object3D, PluginMonitorParams> = {
	id: 'geometry',

	// type: The plugin type.
	// - 'input': Input binding
	// - 'monitor': Monitor binding
	type: 'monitor',

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
		const result = parseParams<PluginMonitorParams>(params, {
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
