<script lang="ts">
	import { checkNearAction } from '../common/actions/checkNear';
	import { Direction } from '$lib/common/types';

	export let direction: Direction;
	let expanded = false;
</script>

<div
	class="dock"
	class:expanded
	class:in={direction == Direction.In}
	class:out={direction == Direction.Out}
	use:checkNearAction={10}
	on:near={(event) => {
		expanded = event.detail;
	}}
>
	<slot />
</div>

<style>
	.dock {
		position: absolute;
		right: 0%;
		top: 50%;

		transform: translate(0%, -50%);

		height: 90vh;
		width: 10px;

		background-color: var(--primary-color);
		border-radius: 4px;

		transition: width 0.2s;
	}
	.expanded {
		width: 40px;
	}
	.in {
		left: 0%;
	}
	.out {
		right: 0%;
	}
</style>
