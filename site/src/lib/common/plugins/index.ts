import type { Pane } from 'tweakpane';

import * as GrouplistPlugin from '@pierogis/tweakpane-plugin-grouplist';

import * as ThreePlugin from './three';

export function registerPlugins(pane: Pane) {
	pane.registerPlugin(ThreePlugin);
	pane.registerPlugin(GrouplistPlugin);
}
