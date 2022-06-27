<script lang="ts" context="module">
	import type { Load } from './__types/__error';

	export const load: Load = ({ error, status }) => {
		const message = `${status}${error ? `: ${error.message}` : ''}`;
		const stack = error ? error.stack : '';
		console.error(message);
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
