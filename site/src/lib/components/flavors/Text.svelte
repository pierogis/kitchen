<script lang="ts">
	import { derived } from 'svelte/store';

	import type { InputParams, MonitorParams } from 'tweakpane';

	import type { Filling } from '@view/fillings';

	export let name: string;
	export let filling: Filling;
	export let options: MonitorParams | InputParams;

	const paramsStore = derived(filling.payload, ($payload) => {
		if (typeof $payload.value != 'string' && typeof $payload.value != 'number')
			throw 'payload value is not string or number';

		return { [name]: $payload.value };
	});
</script>

<slot {paramsStore} optParams={options} />
