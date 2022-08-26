import type { Pane } from 'tweakpane';

import { CanvasInputPlugin, CanvasMonitorPlugin } from './canvas';
import { GroupListBladePlugin, GroupListStringInputPlugin } from './groupList';

export function registerPlugins(pane: Pane) {
	pane.registerPlugin({ plugins: [CanvasInputPlugin, CanvasMonitorPlugin] });
	pane.registerPlugin({ plugins: [GroupListBladePlugin, GroupListStringInputPlugin] });
}
