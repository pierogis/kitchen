import type * as TP from '@tweakpane/core';

import { createPluginView, type CanvasValue } from './view';

interface Config {
	value: TP.Value<CanvasValue> | TP.BufferedValue<CanvasValue>;
	viewProps: TP.ViewProps;
}

// Custom controller class should implement `Controller` interface
export function createPluginController(doc: Document, config: Config): TP.Controller<TP.View> {
	// Receive the bound value from the plugin
	const value: TP.Value<CanvasValue> | TP.BufferedValue<CanvasValue> = config.value;

	// and also view props
	const viewProps: TP.ViewProps = config.viewProps;
	viewProps.handleDispose(() => {});

	// Create a custom view
	const view = createPluginView(doc, {
		value: value,
		viewProps: viewProps
	});

	return {
		view,
		viewProps
	};
}
