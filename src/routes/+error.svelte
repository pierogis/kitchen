<script lang="ts">
	import { page } from '$app/stores';

	const message = `${$page.status}${$page.error ? `: ${$page.error.message}` : ''}`;
	console.error(message);
</script>

<span>{message}</span>
