<script lang="ts">
	import { derived } from 'svelte/store';

	import type { InputParams, MonitorParams } from 'tweakpane';
	import * as THREE from 'three';

	import type { Filling } from '$view/fillings';

	export let name: string;
	export let filling: Filling;
	export let options: MonitorParams | InputParams;

	const scene = new THREE.Scene();

	const paramsStore = derived([filling.payload, filling.camera], ([$payload, $camera]) => {
		scene.clear();

		const object = $payload.value as THREE.Object3D;
		if (object.isObject3D) {
			scene.add(object);
		} else {
			throw 'payload value is not Object';
		}
		return { [name]: { scene, camera: $camera } };
	});
</script>

<slot {paramsStore} optParams={{ ...options, view: 'three' }} />
