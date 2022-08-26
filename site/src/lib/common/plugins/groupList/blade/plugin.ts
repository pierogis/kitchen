import * as TP from '@tweakpane/core';
import { GroupListApi } from './api';

import { GroupListController } from '../common/controller';
import type { GroupListParamsOptgroups } from '../common/params';
import { parseGroupListOptgroups, normalizeGroupListOptgroups } from '../common/util';

export interface GroupListBladeParams<T> extends TP.BaseBladeParams {
	optgroups: GroupListParamsOptgroups<T>;
	value: T;
	view: 'grouplist';

	label?: string;
}

export const GroupListBladePlugin = (function <T>(): TP.BladePlugin<GroupListBladeParams<T>> {
	return {
		id: 'grouplist',
		type: 'blade',
		accept(params) {
			const p = TP.ParamsParsers;
			const result = TP.parseParams<GroupListBladeParams<T>>(params, {
				optgroups: p.required.custom<GroupListParamsOptgroups<T>>(parseGroupListOptgroups),
				value: p.required.raw as TP.ParamsParser<T>,
				view: p.required.constant('grouplist'),

				label: p.optional.string
			});
			return result ? { params: result } : null;
		},
		controller(args) {
			const ic = new GroupListController(args.document, {
				props: TP.ValueMap.fromObject({
					optgroups: normalizeGroupListOptgroups<T>(args.params.optgroups)
				}),
				value: TP.createValue(args.params.value),
				viewProps: args.viewProps
			});
			return new TP.LabeledValueController<T, GroupListController<T>>(args.document, {
				blade: args.blade,
				props: TP.ValueMap.fromObject({
					label: args.params.label
				}),
				valueController: ic
			});
		},
		api(args) {
			if (!(args.controller instanceof TP.LabeledValueController)) {
				return null;
			}
			if (!(args.controller.valueController instanceof GroupListController)) {
				return null;
			}
			return new GroupListApi(args.controller);
		}
	};
})();
