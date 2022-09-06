<div>
	<slot />
</div>

<style global>
	:root {
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

		--focus-color: hsla(220, 70%, 70%, 0.8);
		--remove-color: hsla(0, 70%, 70%, 0.8);
		--cable-color-number: rgba(120, 150, 190, 1);

		--border-radius: 8px;
		--bs-br: var(--border-radius);
	}
	:root {
		--tp-base-background-color: var(--primary-color);
		--tp-base-shadow-color: var(--shadow-color);

		/* button */
		--tp-button-background-color: var(--button-color);
		--tp-button-background-color-active: var(--button-color-active);
		--tp-button-background-color-focus: var(--button-color-focus);
		--tp-button-background-color-hover: var(--button-color-hover);
		--tp-button-foreground-color: var(--label-color);

		/* label */
		--tp-label-background-color: white;
		--tp-label-foreground-color: var(--label-color);

		/* input */
		--tp-input-background-color: var(--input-color);
		--tp-input-background-color-active: var(--input-color-active);
		--tp-input-background-color-focus: var(--input-color-focus);
		--tp-input-background-color-hover: var(--input-color-hover);
		--tp-input-foreground-color: var(--input-color-text);

		--tp-monitor-foreground-color: hsla(80, 10%, 80%, 1);

		--tp-container-background-color: hsla(160, 5%, 20%, 0.3);
		--tp-container-background-color-active: hsla(160, 5%, 20%, 0.6);
		--tp-container-background-color-focus: hsla(160, 5%, 20%, 0.5);
		--tp-container-background-color-hover: hsla(160, 5%, 20%, 0.4);
		--tp-container-foreground-color: hsla(0, 0%, 100%, 0.5);
	}
	body {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu',
			'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		background-color: #282c34;
		margin: 0px;
	}

	.no-select {
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
	}
</style>
