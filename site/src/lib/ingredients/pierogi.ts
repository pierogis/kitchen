import { Writable, writable } from 'svelte/store';
import type { Pane } from 'tweakpane';
import * as ImagePlugin from 'tweakpane-image-plugin';
import { ParameterType } from '../connections/connections';

import type { NodeParameters, NodeState, RacksState } from '../nodes/nodes';
import { IngredientControl } from './ingredients';

interface PierogiParameters extends NodeParameters {
	image: HTMLImageElement;
	width: number;
	height: number;
}

export class PierogiControl extends IngredientControl<PierogiParameters> {
	type = 'pierogi';
	default(id: string, coords: { x: number; y: number }): NodeState<PierogiParameters> {
		let defaultParameters = {
			image: new Image(),
			width: 0,
			height: 0
		};
		let defaultRacks: RacksState = { in: {}, out: {} };
		for (let parameterName in defaultParameters) {
			defaultRacks.out[parameterName] = {
				parameterType: ParameterType.number
			};
		}

		return {
			nodeId: id,
			type: this.type,
			coords: writable(coords),
			parameters: writable(defaultParameters),
			racks: defaultRacks,
			dockedStatus: writable({ docked: false })
		};
	}
	attach(pane: Pane, params: PierogiParameters, store: Writable<PierogiParameters>) {
		pane.registerPlugin(ImagePlugin);

		let imageInput = pane
			.addInput(params, 'image', {
				extensions: '.jpg, .png, .gif, .mp4'
			})
			.on('change', (ev) => {
				store.set({
					image: ev.value,
					width: ev.value.width,
					height: ev.value.height
				});
			});

		let widthInput = pane.addMonitor(params, 'width', {
			disabled: true,
			format: (h) => h.toString()
		});

		let heightInput = pane.addMonitor(params, 'height', {
			disabled: true,
			format: (h) => h.toString()
		});

		return {
			image: imageInput,
			width: widthInput,
			height: heightInput
		};
	}
}
