import type { Pane } from 'tweakpane';
import { registerImagePlugin } from './image';

export function registerPlugins(pane: Pane) {
	registerImagePlugin(pane);
}
