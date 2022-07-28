import type * as TP from '@tweakpane/core';

import { createPluginView, type CanvasValue } from './view';

interface Config {
	value: TP.Value<CanvasValue> | TP.BufferedValue<CanvasValue>;
	viewProps: TP.ViewProps;
}

export function createPluginController(doc: Document, config: Config): TP.Controller<TP.View> {
	const value: TP.Value<CanvasValue> | TP.BufferedValue<CanvasValue> = config.value;

	const viewProps: TP.ViewProps = config.viewProps;
	viewProps.handleDispose(() => {});

	const view = createPluginView(doc, {
		value: value,
		viewProps: viewProps
	});

	return {
		view,
		viewProps
	};
}
