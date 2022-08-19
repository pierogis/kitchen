<script lang="ts">
	import { page } from '$app/stores';

	const message = `${$page.status}${$page.error ? `: ${$page.error.message}` : ''}`;
	const stack = $page.error ? $page.error.stack : '';
	console.error(message);
</script>

<span>{message}</span>
<br />
<br />
<span>{stack}</span>
