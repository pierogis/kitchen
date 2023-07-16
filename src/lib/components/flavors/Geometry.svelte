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
		const geometry = $payload.value as THREE.BufferGeometry;

		if (geometry.isBufferGeometry) {
			scene.add(new THREE.Mesh(geometry));
		} else {
			throw 'payload value is not Geometry';
		}
		return { [name]: { scene, camera: $camera } };
	});
</script>

<slot {paramsStore} optParams={{ ...options, view: 'three' }} />
