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
		const material = $payload.value as THREE.Material;
		if (material.isMaterial) {
			const plane = new THREE.PlaneBufferGeometry(2, 2);
			const mesh = new THREE.Mesh(plane, material);

			scene.add(mesh);
		} else {
			throw 'payload value is not Material';
		}
		return { [name]: { scene, camera: $camera } };
	});
</script>

<slot {paramsStore} optParams={{ ...options, view: 'three' }} />
