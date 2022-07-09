import { get } from 'svelte/store';

import type * as THREE from 'three';

import type { FlatRecipe } from '@recipe';
import type { ViewState } from '@view';
import { FlavorType, Direction, type Payload, type Prep, PrepType } from '@types';
import { prepPrimitives, type PrepOperands, type PrepOutputs } from '../preps';

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

const renderTargetsMap: Map<string, THREE.WebGLRenderTarget> = new Map();
const renderTargets = {
	clear: () => renderTargetsMap.clear(),
	get: (flavorUuid: string, usageUuid: string, direction: Direction) =>
		renderTargetsMap.get([flavorUuid, usageUuid, direction].join(',')),
	set: (
		flavorUuid: string,
		usageUuid: string,
		direction: Direction,
		renderTarget: THREE.WebGLRenderTarget
	) => renderTargetsMap.set([flavorUuid, usageUuid, direction].join(','), renderTarget)
};

export function cook(
	renderer: THREE.WebGLRenderer,
	scene: THREE.Scene,
	camera: THREE.Camera,
	materials: Map<string, THREE.ShaderMaterial>,
	recipe: FlatRecipe,
	viewState: ViewState
) {
	// this will go through the flavor usages in focus (and the docked flavors)
	// and calculate a payload based on that flavor usage's in payload and shaders, expressions, etc.
	// it will set these new out fillings on the view state

	knownPayloads.clear();
	renderTargets.clear();

	// get the main ingredient that we are cooking

	// function cookFlavorUsageInPayload(flavorUuid: string, usageUuid: string) {
	// 	let flavorUsagePayload = knownPayloads.get(flavorUuid, usageUuid, Direction.In);

	// 	const usage = recipe.usages.get(usageUuid);
	// 	if (!usage) throw `usage ${usageUuid} not found`;

	// 	if (!flavorUsagePayload) {
	// 		// find a connection leading in to this flavor usage outside of the usage
	// 		const inFlavorOuterConnection = Array.from(recipe.connections.values()).find(
	// 			(connection) =>
	// 				connection.inFlavorUuid == flavorUuid &&
	// 				connection.inUsageUuid == usage.uuid &&
	// 				connection.parentIngredientUuid != usage.ingredientUuid
	// 		);
	// 		if (inFlavorOuterConnection) {
	// 			// if corresponding out flavor is in the dock of the parent usage
	// 			if (usage.parentUsageUuid == inFlavorOuterConnection.outUsageUuid) {
	// 				// the in fillings on the parent usage need to be all calculated
	// 				flavorUsagePayload = knownPayloads.get(
	// 					inFlavorOuterConnection.outFlavorUuid,
	// 					inFlavorOuterConnection.outUsageUuid,
	// 					Direction.In
	// 				);
	// 			} else {
	// 				// calculate all of the flavors on this usage
	// 				cookUsage(inFlavorOuterConnection.outUsageUuid);

	// 				// now it should be in the map
	// 				flavorUsagePayload = knownPayloads.get(
	// 					inFlavorOuterConnection.outFlavorUuid,
	// 					inFlavorOuterConnection.outUsageUuid,
	// 					Direction.Out
	// 				);
	// 			}

	// 			if (!flavorUsagePayload)
	// 				throw `payload for flavor ${inFlavorOuterConnection.outFlavorUuid} on usage ${inFlavorOuterConnection.outUsageUuid} not found`;

	// 			viewState.fillings.setPayload(flavorUuid, usageUuid, Direction.In, flavorUsagePayload);
	// 		} else {
	// 			// fall back on parameter based or default stored in fillings
	// 			flavorUsagePayload = get(
	// 				viewState.fillings.getFilling(flavorUuid, usageUuid, Direction.In).payload
	// 			);
	// 			if (!flavorUsagePayload)
	// 				throw `in payload for flavor ${flavorUuid} on usage ${usageUuid} not found`;
	// 		}
	// 	}

	// 	return flavorUsagePayload;
	// }

	// function cookFlavorUsageOutPayload(flavorUuid: string, usageUuid: string): Payload<FlavorType> {
	// 	// memoize
	// 	let flavorUsagePayload = knownPayloads.get(flavorUuid, usageUuid, Direction.Out);

	// 	const usage = recipe.usages.get(usageUuid);
	// 	if (!usage) throw `usage ${usageUuid} not found`;

	// 	if (!flavorUsagePayload) {
	// 		// find a connection leading in to this flavor usage inside of the usage
	// 		const outFlavorInnerConnection = Array.from(recipe.connections.values()).find(
	// 			(connection) =>
	// 				connection.inFlavorUuid == flavorUuid &&
	// 				connection.inUsageUuid == usage.uuid &&
	// 				connection.parentIngredientUuid == usage.ingredientUuid
	// 		);

	// 		if (outFlavorInnerConnection) {
	// 			// avoid infinite recursion
	// 			const outUsageIsSame = outFlavorInnerConnection.outUsageUuid == usageUuid;
	// 			if (!outUsageIsSame) {
	// 				// calculate all of the flavors on the previous usage
	// 				cookUsage(outFlavorInnerConnection.outUsageUuid);
	// 				// target out payload should now be in the map
	// 				flavorUsagePayload = knownPayloads.get(
	// 					outFlavorInnerConnection.outFlavorUuid,
	// 					outFlavorInnerConnection.outUsageUuid,
	// 					Direction.Out
	// 				);
	// 				if (!flavorUsagePayload)
	// 					throw `out payload for flavor ${outFlavorInnerConnection.outFlavorUuid} on usage ${outFlavorInnerConnection.outUsageUuid} not found`;
	// 			} else {
	// 				flavorUsagePayload = knownPayloads.get(flavorUuid, usageUuid, Direction.In);
	// 				if (!flavorUsagePayload)
	// 					throw `in payload for flavor ${flavorUuid} on usage ${usageUuid} not found`;
	// 			}
	// 		} else {
	// 			// fall back on param/default stored in fillings
	// 			flavorUsagePayload = get(
	// 				viewState.fillings.getFilling(flavorUuid, usageUuid, Direction.Out).payload
	// 			);
	// 			if (!flavorUsagePayload)
	// 				throw `out payload for flavor ${flavorUuid} on usage ${usageUuid} not found`;
	// 		}
	// 	}

	// 	return flavorUsagePayload;
	// }

	// function render(
	// 	usagePayloads: Map<string, Payload<FlavorType>>,
	// 	usageUuid: string,
	// 	direction: Direction
	// ) {
	// 	// find if this flavor is an image associated with a shader
	// 	for (const shader of recipe.shaders.values()) {
	// 		const payload = usagePayloads.get(shader.imageFlavorUuid);

	// 		if (payload) {
	// 			// get compiled shader program, or compile
	// 			const shaderPayloads: Map<string, Payload<FlavorType>> = new Map();

	// 			// now get the other flavors on this shader ingredient
	// 			for (const [flavorUuid, payload] of usagePayloads) {
	// 				const flavor = recipe.flavors.get(flavorUuid);
	// 				if (!flavor) throw `flavor ${flavorUuid} not found`;
	// 				shaderPayloads.set(flavor.name, payload);
	// 			}

	// 			let material = materials.get(shader.uuid);
	// 			if (material === undefined) {
	// 				// const customShader: Shader = {
	// 				// 	uniforms: {},
	// 				// 	vertexShader: shader.vertexSource,
	// 				// 	fragmentShader: shader.fragmentSource
	// 				// };
	// 				const customShader: Shader = ColorShader;

	// 				material = new ShaderMaterial({
	// 					uniforms: customShader.uniforms,
	// 					vertexShader: customShader.vertexShader,
	// 					fragmentShader: customShader.fragmentShader
	// 				});

	// 				materials.set(shader.uuid, material);
	// 			}

	// 			// set uniforms on material based on the fillings input to this render call
	// 			// material.uniforms = shaderPayloads;

	// 			const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

	// 			const geometry = new BufferGeometry();
	// 			geometry.setAttribute(
	// 				'position',
	// 				new Float32BufferAttribute([-1, 3, 0, -1, -1, 0, 3, -1, 0], 3)
	// 			);
	// 			geometry.setAttribute('uv', new Float32BufferAttribute([0, 2, 0, 0, 2, 0], 2));

	// 			// combine shader material and geometry
	// 			const mesh = new Mesh(geometry, material);

	// 			const renderTarget = new WebGLRenderTarget(window.innerWidth, window.innerHeight);

	// 			renderer.setRenderTarget(renderTarget);
	// 			renderer.render(mesh, camera);

	// 			renderTargets.set(shader.imageFlavorUuid, usageUuid, direction, renderTarget);
	// 		}
	// 	}

	// 	return usagePayloads;
	// }

	function cookFlavor(
		flavorUuid: string,
		usageUuid: string,
		direction: Direction
	): Payload<FlavorType> {
		// memoize
		const payload = knownPayloads.get(flavorUuid, usageUuid, direction);
		if (payload) return payload;

		const flavor = recipe.flavors.get(flavorUuid);
		if (!flavor) throw `flavor ${flavorUuid} not found`;

		if (direction == Direction.Out) {
			// cook prep if part of a prep
			const prep = flavor.prepUuid && recipe.preps.get(flavor.prepUuid);
			if (prep) {
				cookPrep(prep, usageUuid);
				const payload = knownPayloads.get(flavorUuid, usageUuid, direction);
				if (!payload) throw `out payload for flavor ${flavorUuid} on usage ${usageUuid} not found`;
				return payload;
			}
		} else {
			const flavorInConnection = Array.from(recipe.connections.values()).find((connection) => {
				const sameFlavor = connection.inFlavorUuid == flavor.uuid;
				const isInOwnIngredient = connection.parentIngredientUuid == flavor.ingredientUuid;
				return sameFlavor && isInOwnIngredient;
			});

			if (flavorInConnection) {
				// if there is no out usage, this connection goes to a parentIngredient in(!) flavor
				const outFlavorTrueDirection = flavorInConnection.outUsageUuid
					? Direction.Out
					: Direction.In;

				const payload = cookFlavor(
					flavorInConnection.outFlavorUuid,
					flavorInConnection.outUsageUuid || usageUuid,
					outFlavorTrueDirection
				);

				return payload;
			} else {
				// fall back on param/default stored in fillings
				const payload = get(
					viewState.fillings.getFilling(flavorUuid, usageUuid, direction).payload
				);
				if (!payload) throw `out payload for flavor ${flavorUuid} on usage ${usageUuid} not found`;

				return payload;
			}
		}

		throw `could not cook flavor ${flavorUuid}`;
	}

	function cookPrep<T extends PrepType>(prep: Prep<T>, usageUuid: string) {
		const inPayloads: {
			[prepOperandName: string]: Payload<FlavorType>;
		} = {};
		// cook in side of preps (copy from parameters/input)
		for (const [prepFlavorName, flavorUuid] of Object.entries(prep.flavorMap)) {
			const flavor = recipe.flavors.get(flavorUuid);

			if (flavor?.directions.includes(Direction.In)) {
				// why does this keep looping on connect
				const payload = cookFlavor(flavorUuid, usageUuid, Direction.In);
				inPayloads[prepFlavorName] = payload;

				knownPayloads.set(flavorUuid, usageUuid, Direction.In, payload);
				viewState.fillings.setPayload(flavorUuid, usageUuid, Direction.In, payload);
			}
		}

		const outPayloads = prepPrimitives[prep.type].cook(scene, camera, inPayloads);

		for (const [prepFlavorName, payload] of Object.entries(outPayloads)) {
			const flavorUuid = prep.flavorMap[prepFlavorName];
			knownPayloads.set(flavorUuid, usageUuid, Direction.Out, payload);
			viewState.fillings.setPayload(flavorUuid, usageUuid, Direction.Out, payload);
		}
	}

	function cookUsage(usageUuid: string) {
		// work through the flavors on this usage's ingredient
		const usage = recipe.usages.get(usageUuid);
		if (!usage) throw `usage ${usageUuid} not found`;
		// const flavors = Array.from(recipe.flavors.values()).filter(
		// 	(flavor) => flavor.ingredientUuid == usage.ingredientUuid
		// );

		const preps = Array.from(recipe.preps.values()).filter(
			(prep) => prep.ingredientUuid == usage.ingredientUuid
		);

		preps.forEach((prep) => {
			cookPrep(prep, usageUuid);
		});

		// // loop each flavor on the usage's ingredient
		// flavors.forEach((flavor) => {
		// 	if (flavor.directions.includes(Direction.In)) {
		// 		const flavorUsagePayload = cookFlavorUsageInPayload(flavor.uuid, usageUuid);
		// 		knownPayloads.set(flavor.uuid, usageUuid, Direction.In, flavorUsagePayload);
		// 	}
		// });

		// let outUsagePayloads: Map<string, Payload<FlavorType>> = new Map();

		// flavors.forEach((flavor) => {
		// 	if (flavor.directions.includes(Direction.Out)) {
		// 		const flavorUsagePayload = cookFlavorUsageOutPayload(flavor.uuid, usageUuid);
		// 		outUsagePayloads.set(flavor.uuid, flavorUsagePayload);
		// 	}
		// });

		// outUsagePayloads = render(outUsagePayloads, usageUuid, Direction.Out);

		// for (const [flavorUuid, payload] of outUsagePayloads) {
		// 	knownPayloads.set(flavorUuid, usageUuid, Direction.Out, payload);
		// 	viewState.fillings.setPayload(flavorUuid, usageUuid, Direction.Out, payload);
		// }
	}

	// function works from perspective of main ingredient/usage
	cookUsage(recipe.focusedUsageUuid);

	for (const node of get(viewState.nodes)) {
		cookUsage(node.callFor.usageUuid);
	}

	// const dockedFlavors = get(viewState.dockedFlavors);

	// for (const flavor of dockedFlavors) {
	// 	// for image out flavors on the main ingredient
	// 	if (flavor.directions.includes(Direction.Out) && flavor.type == FlavorType.Image) {
	// 		const target = renderTargets.get(flavor.uuid, recipe.focusedUsageUuid, Direction.Out);

	// 		if (!target)
	// 			throw `target for flavor ${flavor.uuid} on usage ${recipe.focusedUsageUuid} not found`;

	// 		const plane = new PlaneBufferGeometry(window.innerWidth, window.innerHeight);
	// 		const material = new MeshBasicMaterial({ map: target.texture });
	// 		const quad = new Mesh(plane, material);

	// 		scene.add(quad);

	// 		renderer.setRenderTarget(null);
	// 		renderer.clearColor();
	// 		renderer.render(scene, camera);
	// 	}
	// }

	renderer.setRenderTarget(null);
	renderer.clearColor();
	renderer.render(scene, camera);
}
