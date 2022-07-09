import type { Pane } from 'tweakpane';
import { GeometryInputPlugin, GeometryMonitorPlugin } from './geometry';

export function registerPlugins(pane: Pane) {
	pane.registerPlugin({ plugins: [GeometryInputPlugin, GeometryMonitorPlugin] });
}
