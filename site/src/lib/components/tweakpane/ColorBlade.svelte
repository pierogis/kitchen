<script lang="ts">
	import type { Writable } from 'svelte/store';

	import type { ColorParams } from '$lib/flavors/color';

	import Blade from './Blade.svelte';
	import type { TpChangeEvent } from 'tweakpane';

	export let paramsStore: Writable<ColorParams>;

	const key = 'color';
</script>

<Blade {paramsStore} {key} {onChange} />
