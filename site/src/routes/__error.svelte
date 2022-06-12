<script lang="ts" context="module">
	import { dev } from '$app/env';

	import type { Load } from './__types/__error';

	export const load: Load = ({ error, status }) => {
		const message = `${status}${dev && error ? `: ${error.message}` : ''}`;
		dev && console.error(message);
		return {
			props: {
				message
			}
		};
	};
</script>

<script lang="ts">
	export let message: string;
</script>

{message}
