import { Direction, type Parameter, type Shader } from '$lib/common/types';
import { FlavorType, type Flavor } from '$lib/flavors';
import type { Connection } from '$lib/connections';
import type { Ingredient } from '$lib/ingredients';

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
	shaderParameters: Map<string, Parameter>
) {
	let vertices: number[] = [-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0];
	let vertex_buffer = gl.createBuffer();
	const view = new Float32Array(vertices);

	gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, view, gl.STATIC_DRAW);

	gl.useProgram(program);

	// Attach the position vector as an attribute for the GL gl.
	let position = gl.getAttribLocation(program, 'a_position');
	gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(position);

	for (const [parameterName, parameter] of shaderParameters) {
		// Attach the color as a uniform for the GL gl.
		let uniform = gl.getUniformLocation(program, `u_${parameterName}`);
		// parameter.value
		// switch on parameter.type to determine uniform3f, texture, etc
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

function getPreviousFlavorId(
	flavorId: number,
	connections: Map<number, Connection>
): number | undefined {
	for (const connection of connections.values()) {
		if (connection.inFlavorId == flavorId) {
			return connection.outFlavorId;
		}
	}
}

function calculateFlavor(
	gl: WebGLRenderingContext,
	flavorId: number,
	connections: Map<number, Connection>,
	knownParameters: Map<number, Parameter>,
	shaders: Map<number, Shader>,
	flavors: Map<number, Flavor>,
	programs: Map<number, WebGLProgram>
): Parameter {
	// get the flavor leading to this flavor's in connection (if exists)
	const previousFlavorId = getPreviousFlavorId(flavorId, connections);

	let calculatedParameter: Parameter | undefined;

	if (previousFlavorId) {
		// the value from the previous may be already calculated
		calculatedParameter = knownParameters.get(previousFlavorId);

		if (!calculatedParameter) {
			// if not already calculated, do that one first
			calculatedParameter = calculateFlavor(
				gl,
				previousFlavorId,
				connections,
				knownParameters,
				shaders,
				flavors,
				programs
			);
		}
	}

	// find if this flavor is an image associated with a shader
	for (const shader of shaders.values()) {
		if (shader.imageFlavorId == flavorId) {
			// get compiled shader program, or compile

			const shaderParameters: Map<string, Parameter> = new Map();

			// now get the other flavors on this shader ingredient
			for (const flavor of flavors.values()) {
				if (flavor.ingredientId == shader.ingredientId && flavor.id != flavorId) {
					const subFlavorId = flavor.id;
					let calculatedSubFlavorParameter = knownParameters.get(subFlavorId);
					if (!calculatedSubFlavorParameter) {
						calculatedSubFlavorParameter = calculateFlavor(
							gl,
							subFlavorId,
							connections,
							knownParameters,
							shaders,
							flavors,
							programs
						);
						knownParameters.set(subFlavorId, calculatedSubFlavorParameter);
					}

					shaderParameters.set(flavor.name, calculatedSubFlavorParameter);
				}
			}

			// run shader program with uniforms and cookedPrevious
			let program = programs.get(shader.id);
			if (program === undefined) {
				program = createProgram(gl, shader.vertexSource, shader.fragmentSource);

				programs.set(shader.id, program);
			}

			drawOnTexture(gl, program, shaderParameters);
		}
	}

	if (calculatedParameter) {
		knownParameters.set(flavorId, calculatedParameter);
		return calculatedParameter;
	} else {
		throw "Couldn't calculate parameter";
	}
}

export function draw(
	gl: WebGLRenderingContext,
	mainIngredientId: number,
	knownParameters: Map<number, Parameter>,
	connections: Map<number, Connection>,
	ingredients: Map<number, Ingredient>,
	flavors: Map<number, Flavor>,
	shaders: Map<number, Shader>,
	programs: Map<number, WebGLProgram>
) {
	// function findPathFromSourceFlavor(flavorId: number, path: number[] = []): number[] {
	// 	for (const connection of connections.values()) {
	// 		if (connection.inFlavorId == flavorId) {
	// 			let calculatedParameter = knownParameters.get(connection.outFlavorId);
	// 			if (calculatedParameter) {
	// 			}
	// 			path.push(flavorId);
	// 			return findPathFromSourceFlavor(connection.outFlavorId, path);
	// 		}
	// 	}

	// 	return path;
	// }

	// get the main ingredient that we are cooking
	let mainIngredient = ingredients.get(mainIngredientId);

	if (mainIngredient) {
		// find image out flavors on the main ingredient
		for (const flavor of flavors.values()) {
			if (
				flavor.type == FlavorType.Image &&
				Direction.Out in flavor.directions &&
				flavor.ingredientId == mainIngredientId
			) {
				let texture = createTexture(gl);
				calculateFlavor(gl, flavor.id, connections, knownParameters, shaders, flavors, programs);

				drawCanvasFramebuffer(gl, texture);
			}
		}
	}

	// go to recipe main ingredient
	// get an image out flavor
	// loop until focused flavor has no inConnection (routine 1)
	//     find that flavor's inConnection
	//     focus on the corresponding outFlavor of that connection
	//     assemble a list of flavors to calculate in the opposite order traversed
	// calculate focused flavor (open from file)
	// loop walking back through list of image flavors, popping from front (routine 2)
	//     check if this flavor is part of a shader
	//     if so
	//         compile this shader with code and classify by id
	//         get the ingredient/sibling flavors to act as uniforms
	//         loop each sibling flavor
	//             proceed back through inConnection until no inconnection, taking list of flavors (routine 1)
	//                 if "source" is a shader, calculate that shader first, using this same traverse technique
	//                 maintain list of calculated shaders, and prefer results of that
	//
	//
	//     calculate current flavor
}
