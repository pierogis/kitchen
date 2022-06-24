import type { FlatRecipe } from '@recipe';
import type { ViewState } from '@view';
import { FlavorType, Direction, type Payload } from '@types';
import { get } from 'svelte/store';

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

export function drawOnTexture(
	gl: WebGLRenderingContext,
	program: WebGLProgram,
	shaderPayloads: Map<string, Payload<FlavorType>>
) {
	const vertices: number[] = [-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0];
	const vertex_buffer = gl.createBuffer();
	const view = new Float32Array(vertices);

	gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, view, gl.STATIC_DRAW);

	gl.useProgram(program);

	// Attach the position vector as an attribute for the GL gl.
	const position = gl.getAttribLocation(program, 'a_position');
	gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(position);

	for (const [payloadName, _payload] of shaderPayloads) {
		// Attach the color as a uniform for the GL gl.
		const uniform = gl.getUniformLocation(program, `u_${payloadName}`);
		// switch on payload.type to determine uniform3f, texture, etc
		gl.uniform3f(uniform, 255, 223, 211);
	}

	gl.drawArrays(gl.TRIANGLES, 0, 6);
}

export function drawCanvasFramebuffer(gl: WebGLRenderingContext, targetTexture: WebGLTexture) {
	// draw the layered texture onto the canvas fb
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.bindTexture(gl.TEXTURE_2D, targetTexture);

	// Tell WebGL how to convert from clip space to pixels
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

	// Clear the canvas AND the depth buffer.
	gl.clearColor(1, 1, 1, 1); // clear to white
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

const knownPayloads: Map<string, Payload<FlavorType>> = new Map();

export function calculateOutPayloads(
	gl: WebGLRenderingContext,
	programs: Map<string, WebGLProgram>,
	recipe: FlatRecipe,
	viewState: ViewState
) {
	// this will go through the flavor usages in focus (and the docked flavors)
	// and calculate a payload based on that flavor usage's in payload and shaders, expressions, etc.
	// it will set these new out payloads on the view state

	knownPayloads.clear();
	// get the main ingredient that we are cooking

	function calculateFlavorUsage(flavorUuid: string, usageUuid: string): Payload<FlavorType> {
		// memoize
		let flavorUsagePayload = knownPayloads.get([flavorUuid, usageUuid].join(','));

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
				// calculate all of the flavors on this usage
				calculateUsage(inFlavorOuterConnection.outUsageUuid);

				// now it should be in the map
				flavorUsagePayload = knownPayloads.get(
					[inFlavorOuterConnection.outFlavorUuid, inFlavorOuterConnection.outUsageUuid].join(',')
				);

				if (!flavorUsagePayload)
					throw `payload for flavor ${inFlavorOuterConnection.outFlavorUuid} on usage ${inFlavorOuterConnection.outUsageUuid} not found`;
			} else {
				const parameter = Array.from(recipe.parameters.values()).find((parameter) => {
					parameter.flavorUuid == flavorUuid && parameter.usageUuid == usageUuid;
				});

				if (parameter) {
					// use the parameter for this flavor usage
					flavorUsagePayload = parameter.payload;
				} else {
					// fall back on default stored in payloads?
					flavorUsagePayload = get(viewState.payloads.getPayload(flavorUuid, usageUuid));
					// throw `parameter for flavor ${flavorUuid} on usage ${usageUuid} not found`;
				}
			}

			// find a connection leading in to this flavor usage inside of the usage
			const outFlavorInnerConnection = Array.from(recipe.connections.values()).find(
				(connection) =>
					connection.inFlavorUuid == flavorUuid &&
					connection.inUsageUuid == usage.uuid &&
					connection.parentIngredientUuid == usage.ingredientUuid
			);

			if (outFlavorInnerConnection) {
				// calculate all of the flavors on the previous usage
				calculateUsage(outFlavorInnerConnection.outUsageUuid);
				// now it should be in the map
				flavorUsagePayload = knownPayloads.get(
					[outFlavorInnerConnection.outFlavorUuid, outFlavorInnerConnection.outUsageUuid].join(',')
				);

				if (!flavorUsagePayload)
					throw `payload for flavor ${outFlavorInnerConnection.outFlavorUuid} on usage ${outFlavorInnerConnection.outUsageUuid} not found`;
			}
		}
		return flavorUsagePayload;
	}

	function applyUsageShader(usagePayloads: Map<string, Payload<FlavorType>>) {
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

				// run shader program with uniforms and cookedPrevious
				let program = programs.get(shader.uuid);
				if (program === undefined) {
					program = createProgram(gl, shader.vertexSource, shader.fragmentSource);

					programs.set(shader.uuid, program);
				}

				drawOnTexture(gl, program, shaderPayloads);
			}
		}

		return usagePayloads;
	}

	function calculateUsage(usageUuid: string) {
		// work through the flavors on this usage's ingredient
		const usage = recipe.usages.get(usageUuid);
		if (!usage) throw `usage ${usageUuid} not found`;
		const flavors = Array.from(recipe.flavors.values()).filter(
			(flavor) => flavor.ingredientUuid == usage.ingredientUuid
		);

		// loop each flavor on the usage's ingredient
		let payloads = new Map(
			flavors.map((flavor) => [flavor.uuid, calculateFlavorUsage(flavor.uuid, usageUuid)])
		);

		payloads = applyUsageShader(payloads);

		for (const [flavorUuid, payload] of payloads) {
			knownPayloads.set([flavorUuid, usageUuid].join(','), payload);
			viewState.payloads.setPayload(flavorUuid, usageUuid, payload);
		}
	}

	// function works from perspective of main ingredient/usage
	calculateUsage(recipe.focusedUsageUuid);

	const dockedFlavors = Array.from(recipe.flavors.values()).filter(
		(flavor) => flavor.ingredientUuid == recipe.focusedIngredientUuid
	);

	for (const flavor of dockedFlavors) {
		// for image out flavors on the main ingredient
		if (Direction.Out in flavor.directions && flavor.type == FlavorType.Image) {
			const texture = createTexture(gl);

			drawCanvasFramebuffer(gl, texture);
		}
	}
}
