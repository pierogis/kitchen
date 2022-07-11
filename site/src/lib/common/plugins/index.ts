import type { Pane } from 'tweakpane';
import { CanvasInputPlugin, CanvasMonitorPlugin } from './canvas';

export function registerPlugins(pane: Pane) {
	pane.registerPlugin({ plugins: [CanvasInputPlugin, CanvasMonitorPlugin] });
}
