<script lang="ts" context="module">
	import { dev } from '$app/env';

	import type { Load } from './__types/__error';

	export const load: Load = ({ error, status }) => {
		const message = `${status}${dev && error ? `: ${error.message}` : ''}`;
		const stack = dev && error ? error.stack : '';
		dev && console.error(message);
		return {
			props: {
				message,
				stack
			}
		};
	};
</script>

<script lang="ts">
	export let message: string;
	export let stack: string;
</script>

<span>{message}</span>
<br />
<br />
<span>{stack}</span>
