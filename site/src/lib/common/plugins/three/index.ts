import type { TpPlugin } from '@tweakpane/core';

import { ThreeInputPlugin } from './input';
import { ThreeMonitorPlugin } from './monitor';

export const plugins: TpPlugin[] = [ThreeInputPlugin, ThreeMonitorPlugin];
