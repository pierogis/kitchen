import { get } from 'svelte/store';

import type { Shader, WebGLRenderer } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';

import type { FlatRecipe } from '@recipe';
import type { ViewState } from '@view';
import { FlavorType, Direction, type Payload } from '@types';
import { ColorShader } from './shaders/color';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import type { Pass } from 'three/examples/jsm/postprocessing/Pass';

export function createTexture(gl: WebGLRenderingContext): WebGLTexture {
	// create a texture to sequentially draw on
	const targetTextureWidth = 256;
	const targetTextureHeight = 256;
	const targetTexture = gl.createTexture();
	if (targetTexture) {
		gl.bindTexture(gl.TEXTURE_2D, targetTexture);

		// define size and format of level 0
		const level = 0;
		const internalFormat = gl.RGBA;
		const border = 0;
		const format = gl.RGBA;
		const type = gl.UNSIGNED_BYTE;
		const data = null;
		gl.texImage2D(
			gl.TEXTURE_2D,
			level,
			internalFormat,
			targetTextureWidth,
			targetTextureHeight,
			border,
			format,
			type,
			data
		);

		// set the filtering so we don't need mips
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		const fb = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
		const attachmentPoint = gl.COLOR_ATTACHMENT0;
		gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, targetTexture, level);

		return targetTexture;
	} else {
		throw "Couldn't create texture";
	}
}

export function createProgram(
	gl: WebGLRenderingContext,
	vertexSource: string,
	fragmentSource: string
): WebGLProgram {
	const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
	if (fragShader) {
		gl.shaderSource(fragShader, fragmentSource);
		gl.compileShader(fragShader);
	} else {
		throw 'Failed to compile fragment shader';
	}

	const vertShader = gl.createShader(gl.VERTEX_SHADER);
	if (vertShader) {
		gl.shaderSource(vertShader, vertexSource);
		gl.compileShader(vertShader);
	} else {
		throw 'Failed to compile vertex shader';
	}

	const program = gl.createProgram();
	if (program) {
		gl.attachShader(program, fragShader);
		gl.attachShader(program, vertShader);
		gl.linkProgram(program);

		return program;
	} else {
		throw 'Failed to create program';
	}
}

export function drawCanvasFramebuffer(gl: WebGLRenderingContext, targetTexture: WebGLTexture) {
	// draw the layered texture onto the canvas fb
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.bindTexture(gl.TEXTURE_2D, targetTexture);

	// Tell WebGL how to convert from clip space to pixels
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

	// Clear the canvas AND the depth buffer.
	gl.clearColor(0.3, 0.35, 0.3, 1); // clear to grey
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

const knownPayloadsMap: Map<string, Payload<FlavorType>> = new Map();
const knownPayloads = {
	clear: () => knownPayloadsMap.clear(),
	get: (flavorUuid: string, usageUuid: string, direction: Direction) =>
		knownPayloadsMap.get([flavorUuid, usageUuid, direction].join(',')),
	set: (
		flavorUuid: string,
		usageUuid: string,
		direction: Direction,
		payload: Payload<FlavorType>
	) => knownPayloadsMap.set([flavorUuid, usageUuid, direction].join(','), payload)
};

export function cookPayloads(
	renderer: WebGLRenderer,
	passes: Map<string, Pass>,
	recipe: FlatRecipe,
	viewState: ViewState
) {
	// this will go through the flavor usages in focus (and the docked flavors)
	// and calculate a payload based on that flavor usage's in payload and shaders, expressions, etc.
	// it will set these new out payloads on the view state

	knownPayloads.clear();

	const composer = new EffectComposer(renderer);
	// get the main ingredient that we are cooking

	function cookFlavorUsageInPayload(flavorUuid: string, usageUuid: string) {
		let flavorUsagePayload = knownPayloads.get(flavorUuid, usageUuid, Direction.In);

		const usage = recipe.usages.get(usageUuid);
		if (!usage) throw `usage ${usageUuid} not found`;

		if (!flavorUsagePayload) {
			// find a connection leading in to this flavor usage outside of the usage
			const inFlavorOuterConnection = Array.from(recipe.connections.values()).find(
				(connection) =>
					connection.inFlavorUuid == flavorUuid &&
					connection.inUsageUuid == usage.uuid &&
					connection.parentIngredientUuid != usage.ingredientUuid
			);
			if (inFlavorOuterConnection) {
				// if corresponding out flavor is in the dock of the parent usage
				if (usage.parentUsageUuid == inFlavorOuterConnection.outUsageUuid) {
					// the in payloads on the parent usage need to be all calculated
					flavorUsagePayload = knownPayloads.get(
						inFlavorOuterConnection.outFlavorUuid,
						inFlavorOuterConnection.outUsageUuid,
						Direction.In
					);
				} else {
					// calculate all of the flavors on this usage
					cookUsage(inFlavorOuterConnection.outUsageUuid);

					// now it should be in the map
					flavorUsagePayload = knownPayloads.get(
						inFlavorOuterConnection.outFlavorUuid,
						inFlavorOuterConnection.outUsageUuid,
						Direction.Out
					);
				}

				if (!flavorUsagePayload)
					throw `payload for flavor ${inFlavorOuterConnection.outFlavorUuid} on usage ${inFlavorOuterConnection.outUsageUuid} not found`;

				viewState.payloads.setPayload(flavorUuid, usageUuid, Direction.In, flavorUsagePayload);
			} else {
				// fall back on parameter based or default stored in payloads
				flavorUsagePayload = get(
					viewState.payloads.getPayload(flavorUuid, usageUuid, Direction.In)
				);
				if (!flavorUsagePayload)
					throw `in payload for flavor ${flavorUuid} on usage ${usageUuid} not found`;
			}
		}

		return flavorUsagePayload;
	}

	function cookFlavorUsageOutPayload(flavorUuid: string, usageUuid: string): Payload<FlavorType> {
		// memoize
		let flavorUsagePayload = knownPayloads.get(flavorUuid, usageUuid, Direction.Out);

		const usage = recipe.usages.get(usageUuid);
		if (!usage) throw `usage ${usageUuid} not found`;

		if (!flavorUsagePayload) {
			// find a connection leading in to this flavor usage inside of the usage
			const outFlavorInnerConnection = Array.from(recipe.connections.values()).find(
				(connection) =>
					connection.inFlavorUuid == flavorUuid &&
					connection.inUsageUuid == usage.uuid &&
					connection.parentIngredientUuid == usage.ingredientUuid
			);

			if (outFlavorInnerConnection) {
				// avoid infinite recursion
				const outUsageIsSame = outFlavorInnerConnection.outUsageUuid == usageUuid;
				if (!outUsageIsSame) {
					// calculate all of the flavors on the previous usage
					cookUsage(outFlavorInnerConnection.outUsageUuid);
					// target out payload should now be in the map
					flavorUsagePayload = knownPayloads.get(
						outFlavorInnerConnection.outFlavorUuid,
						outFlavorInnerConnection.outUsageUuid,
						Direction.Out
					);
					if (!flavorUsagePayload)
						throw `out payload for flavor ${outFlavorInnerConnection.outFlavorUuid} on usage ${outFlavorInnerConnection.outUsageUuid} not found`;
				} else {
					flavorUsagePayload = knownPayloads.get(flavorUuid, usageUuid, Direction.In);
					if (!flavorUsagePayload)
						throw `in payload for flavor ${flavorUuid} on usage ${usageUuid} not found`;
				}
			} else {
				// fall back on param/default stored in payloads
				flavorUsagePayload = get(
					viewState.payloads.getPayload(flavorUuid, usageUuid, Direction.Out)
				);
				if (!flavorUsagePayload)
					throw `out payload for flavor ${flavorUuid} on usage ${usageUuid} not found`;
			}
		}

		return flavorUsagePayload;
	}

	function render(usagePayloads: Map<string, Payload<FlavorType>>) {
		// find if this flavor is an image associated with a shader
		for (const shader of recipe.shaders.values()) {
			if (shader.imageFlavorUuid in usagePayloads.keys()) {
				// get compiled shader program, or compile

				const shaderPayloads: Map<string, Payload<FlavorType>> = new Map();

				// now get the other flavors on this shader ingredient
				for (const [flavorUuid, payload] of usagePayloads) {
					const flavor = recipe.flavors.get(flavorUuid);
					if (!flavor) throw `flavor ${flavorUuid} not found`;
					shaderPayloads.set(flavor.name, payload);
				}

				let pass = passes.get(shader.uuid);
				if (pass === undefined) {
					// const customShader: Shader = {
					// 	uniforms: shader.uniforms,
					// 	vertexShader: shader.vertexSource,
					// 	fragmentShader: shader.fragmentSource
					// };
					const customShader: Shader = ColorShader;
					const customPass = new ShaderPass(customShader);

					composer.addPass(customPass);
					passes.set(shader.uuid, customPass);
				}
			}
		}

		return usagePayloads;
	}

	function cookUsage(usageUuid: string) {
		// work through the flavors on this usage's ingredient
		const usage = recipe.usages.get(usageUuid);
		if (!usage) throw `usage ${usageUuid} not found`;
		const flavors = Array.from(recipe.flavors.values()).filter(
			(flavor) => flavor.ingredientUuid == usage.ingredientUuid
		);

		// loop each flavor on the usage's ingredient
		flavors.forEach((flavor) => {
			if (flavor.directions.includes(Direction.In)) {
				const flavorUsagePayload = cookFlavorUsageInPayload(flavor.uuid, usageUuid);
				knownPayloads.set(flavor.uuid, usageUuid, Direction.In, flavorUsagePayload);
			}
		});

		let outUsagePayloads: Map<string, Payload<FlavorType>> = new Map();

		flavors.forEach((flavor) => {
			if (flavor.directions.includes(Direction.Out)) {
				const flavorUsagePayload = cookFlavorUsageOutPayload(flavor.uuid, usageUuid);
				outUsagePayloads.set(flavor.uuid, flavorUsagePayload);
			}
		});

		outUsagePayloads = render(outUsagePayloads);

		for (const [flavorUuid, payload] of outUsagePayloads) {
			knownPayloads.set(flavorUuid, usageUuid, Direction.Out, payload);
			viewState.payloads.setPayload(flavorUuid, usageUuid, Direction.Out, payload);
		}
	}

	// function works from perspective of main ingredient/usage
	cookUsage(recipe.focusedUsageUuid);

	for (const node of get(viewState.nodes)) {
		cookUsage(node.callFor.usageUuid);
	}

	const dockedFlavors = Array.from(recipe.flavors.values()).filter(
		(flavor) => flavor.ingredientUuid == recipe.focusedIngredientUuid
	);

	for (const flavor of dockedFlavors) {
		// for image out flavors on the main ingredient
		if (flavor.directions.includes(Direction.Out) && flavor.type == FlavorType.Image) {
			composer.render();
		}
	}
}
