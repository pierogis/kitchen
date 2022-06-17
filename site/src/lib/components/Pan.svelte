<script lang="ts">
	import { getContext, onMount, tick } from 'svelte';

	import {
		type Parameter,
		type Shader,
		type Connection,
		type Ingredient,
		type Flavor,
		FlavorType,
		Direction
	} from '$lib/common/types';

	import { draw } from '$lib/common/draw';
	import CursorCircle from './CursorCircle.svelte';
	import type { Coordinates } from '$lib/state/stores/view';
	import { ActionType, type Action } from '$lib/state/actions';
	import type { createIngredient } from '$lib/state/handlers/ingredients';
	import { get, writable, type Readable } from 'svelte/store';
	import type { RecipeState } from '$lib/state/stores/recipe';

	export let width: number;
	export let height: number;

	export let mainCallForUuid: string;
	export let flavors: Map<string, Flavor>;
	export let ingredients: Map<string, Ingredient>;
	export let connections: Map<string, Connection>;
	export let shaders: Map<string, Shader>;

	export let cursorCoordinates: Readable<Coordinates>;

	let canvas: HTMLCanvasElement;
	const recipeState: RecipeState = getContext('recipe');

	// export let media: (HTMLImageElement | HTMLVideoElement | HTMLAudioElement | WebGLTexture)[];

	const programs: Map<string, WebGLProgram> = new Map();
	export let parameters: Map<string, Parameter>;

	onMount(async () => {
		await tick();
		let gl = canvas.getContext('webgl');

		let frame: number;
		function loop() {
			frame = requestAnimationFrame(loop);

			if (gl) {
				const knownParameters: Map<string, Parameter> = new Map(parameters);
				draw(
					gl,
					mainCallForUuid,
					knownParameters,
					connections,
					ingredients,
					flavors,
					shaders,
					programs
				);
			}
		}
		loop();

		return () => cancelAnimationFrame(frame);
	});

	function createIngredient(coordinates: { x: number; y: number }) {
		const action: Action<ActionType.CreateIngredient> = {
			type: ActionType.CreateIngredient,
			params: {
				ingredient: {
					name: 'default'
				},
				callFor: {
					parentCallForUuid: get(recipeState.focusedCallForUuid),
					recipeUuid: get(recipeState.recipeUuid)
				},
				location: { ...coordinates },
				flavors: [
					{
						type: FlavorType.Text,
						name: 'text',
						options: null,
						directions: [Direction.Out]
					}
				]
			}
		};

		recipeState.dispatch(action);
	}

	const pressing = writable(false);

	function longPressAction(canvas: HTMLCanvasElement) {
		const touchDuration = 500;

		// this timer will fire a callback if you press long enough
		let longPressTimer: NodeJS.Timeout | null;

		function handleMouseUp() {
			// nullify longpress timer from click
			$pressing = false;
			if (longPressTimer) {
				clearTimeout(longPressTimer);
				longPressTimer = null;
			}
		}

		function handleMouseDown(event: MouseEvent) {
			// click
			if (!longPressTimer && event.button == 0) {
				window.addEventListener('mouseup', handleMouseUp);
				$pressing = true;
				// send an event at end of timer
				longPressTimer = setTimeout(() => {
					longPressTimer = null;
					window.removeEventListener('mouseup', handleMouseUp);
					$pressing = false;
					// notify parent that there has been a long press
					createIngredient($cursorCoordinates);
				}, touchDuration);
			}
		}

		canvas.addEventListener('mousedown', handleMouseDown);

		return {
			destroy: () => {
				window.removeEventListener('mouseup', handleMouseUp);
				canvas.removeEventListener('mousedown', handleMouseDown);
			}
		};
	}
</script>

<canvas bind:this={canvas} use:longPressAction {width} {height} />

<CursorCircle {cursorCoordinates} pressing={$pressing} />
