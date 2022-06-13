<div style:overflow-y="hidden">
	<slot />
</div>

<style>
	:global(:root) {
		--primary-color: hsla(160, 20%, 75%, 0.8);
		--shadow-color: hsla(0, 0%, 0%, 0.2);
		--label-color: hsla(230, 5%, 30%, 0.7);

		--button-color: hsla(0, 0%, 70%, 1);
		--button-color-active: hsla(0, 0%, 100%, 1);
		--button-color-focus: hsla(0, 0%, 95%, 1);
		--button-color-hover: hsla(0, 0%, 85%, 1);

		--input-color: hsla(80, 10%, 90%, 0.5);
		--input-color-active: hsla(80, 10%, 100%, 0.5);
		--input-color-focus: hsla(80, 10%, 95%, 0.5);
		--input-color-hover: hsla(80, 10%, 85%, 0.5);
		--input-color-text: hsla(80, 50%, 25%, 1);

		--remove-color: hsla(0, 80%, 70%, 0.8);
		--cable-color-number: rgba(120, 150, 190, 1);
	}
	:global(body) {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu',
			'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		background-color: #282c34;
		margin: 0px;
	}
</style>
