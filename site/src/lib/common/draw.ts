import type { FlatRecipe } from '@recipe';
import type { ViewState } from '@view';
import { type Connection, FlavorType, Direction, type Payload } from '@types';
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

function getSourceFlavorUuid(
	flavorUuid: string,
	connections: Map<string, Connection>
): string | undefined {
	for (const connection of connections.values()) {
		if (connection.inFlavorUuid == flavorUuid) {
			return connection.outFlavorUuid;
		}
	}
}

function calculateFlavorUsage(
	gl: WebGLRenderingContext,
	flavorUuid: string,
	usageUuid: string,
	recipe: FlatRecipe,
	viewState: ViewState,
	knownPayloads: Map<string, Payload<FlavorType>>,
	programs: Map<string, WebGLProgram>
): Payload<FlavorType> {
	// get the flavor leading to this flavor's in connection (if exists)
	const sourceFlavorUuid = getSourceFlavorUuid(flavorUuid, recipe.connections);

	if (sourceFlavorUuid) {
		// the value from the previous may be already calculated
		calculatedPayload = knownPayloads.get([flavorUuid, usageUuid].join(','));

		if (!calculatedPayload) {
			// if not already calculated, do that one first
			calculatedPayload = calculateFlavorUsage(
				gl,
				sourceFlavorUuid,
				usageUuid,
				recipe,
				viewState,
				knownPayloads,
				programs
			);
		}
	} else {
		let calculatedPayload: Payload<FlavorType> | undefined = knownPayloads.get(
			[flavorUuid, usageUuid].join(',')
		);

		if (calculatedPayload) {
		}
	}

	// find if this flavor is an image associated with a shader
	for (const shader of recipe.shaders.values()) {
		if (shader.imageFlavorUuid == flavorUuid) {
			// get compiled shader program, or compile

			const shaderPayloads: Map<string, Payload<FlavorType>> = new Map();

			// now get the other flavors on this shader ingredient
			for (const flavor of recipe.flavors.values()) {
				if (flavor.ingredientUuid == shader.ingredientUuid && flavor.uuid != flavorUuid) {
					const subFlavorUuid = flavor.uuid;
					let calculatedSubFlavorPayload = knownPayloads.get([subFlavorUuid, usageUuid].join(','));
					if (!calculatedSubFlavorPayload) {
						calculatedSubFlavorPayload = calculateFlavorUsage(
							gl,
							subFlavorUuid,
							usageUuid,
							recipe,
							viewState,
							knownPayloads,
							programs
						);
						knownPayloads.set(subFlavorUuid, calculatedSubFlavorPayload);
					}

					shaderPayloads.set(flavor.name, calculatedSubFlavorPayload);
				}
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

	if (calculatedPayload) {
		knownPayloads.set(flavorUuid, calculatedPayload);
		return calculatedPayload;
	} else {
		throw "couldn't calculate payload";
	}
}

export function draw(
	gl: WebGLRenderingContext,
	programs: Map<string, WebGLProgram>,
	recipe: FlatRecipe,
	viewState: ViewState
) {
	// get the main ingredient that we are cooking
	const focusedIngredient = recipe.ingredients.get(recipe.focusedIngredientUuid);

	// keyed by [flavorUuid, usageUuid].join(',')
	const newPayloads: Map<
		string,
		{ inPayload: Payload<FlavorType> | undefined; outPayload: Payload<FlavorType> }
	> = new Map(
		Array.from(recipe.parameters.values()).map((parameter) => {
			const callFor = recipe.callsFor.get(parameter.callForUuid);
			if (!callFor)
				throw `callFor ${parameter.callForUuid} for parameter ${parameter.callForUuid} not found`;
			const key = [parameter.flavorUuid, callFor.usageUuid].join(',');
			return [key, { inPayload: undefined, outPayload: parameter.payload }];
		})
	);

	for (const flavorUsage of get(viewState.inFocusFlavorUsages)) {
		newPayloads.set([flavorUsage.uuid, flavorUsage.usageUuid].join(','), { inPayload });
	}

	for (const usage of viewState.focusedUsages.values()) {
		const flavors = Array.from(recipe.flavors.values()).filter(
			(flavor) => flavor.ingredientUuid == usage.ingredientUuid
		);

		for (const flavor of flavors) {
			let payload = newPayloads.get([flavor.uuid, usage.uuid].join(','));
			if (!payload?.outPayload) {
				payload = calculateFlavorUsage(
					gl,
					flavor.uuid,
					usage.uuid,
					recipe,
					viewState,
					newPayloads,
					programs
				);
			}

			// for image out flavors on the main ingredient
			if (Direction.Out in flavor.directions && flavor.type == FlavorType.Image) {
				const texture = createTexture(gl);

				drawCanvasFramebuffer(gl, texture);
			}

			viewState.payloads.setPayload(flavor.uuid, usage.uuid, calculatedPayload);
		}
	}
}
