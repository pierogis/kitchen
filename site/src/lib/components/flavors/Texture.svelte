<script lang="ts">
	import { derived } from 'svelte/store';

	import type { InputParams, MonitorParams } from 'tweakpane';
	import * as THREE from 'three';

	import type { Filling } from '@view/fillings';

	export let name: string;
	export let filling: Filling;
	export let options: MonitorParams | InputParams;

	const scene = new THREE.Scene();
	const paramsStore = derived([filling.payload, filling.camera], ([$payload, $camera]) => {
		scene.clear();
		const texture = $payload.value as THREE.Texture;
		if (texture.isTexture) {
			const plane = new THREE.PlaneBufferGeometry();
			const material = new THREE.MeshBasicMaterial({ map: texture });

			scene.add(new THREE.Mesh(plane, material));
		} else {
			throw 'payload value is not Texture';
		}
		return { [name]: { scene, camera: $camera } };
	});
</script>

<slot {paramsStore} optParams={{ ...options, view: 'canvas' }} />
