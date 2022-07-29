<script lang="ts">
	export let attached: boolean;
</script>

<button class:attached>+</button>

<style>
	button {
		background-color: var(--primary-color);
		color: var(--label-color);

		border: 0;
		margin: 0;
		padding-top: 0;
		padding-bottom: 4px;

		font-size: 1.1rem;
		line-height: 100%;

		border-radius: 4px 4px 4px 4px;

		align-self: center;
	}

	.attached {
		border-top: 1px var(--shadow-color) solid;
		border-radius: 0 0 4px 4px;
	}
</style>
