import * as TP from '@tweakpane/core';

import {
	createGroupListConstraint,
	findGroupListItems,
	parseGroupListOptgroups
} from '../common/util';
import type { GroupListParamsOptgroups } from '../common/params';
import { GroupListController } from '../common/controller';

export interface StringGroupListInputParams extends TP.BaseInputParams {
	optgroups: GroupListParamsOptgroups<string>;
}

function createConstraint(params: StringGroupListInputParams): TP.Constraint<string> {
	const constraints: TP.Constraint<string>[] = [];

	const lc = createGroupListConstraint<string>(params.optgroups);
	if (lc) {
		constraints.push(lc);
	}

	return new TP.CompositeConstraint(constraints);
}

export const GroupListStringInputPlugin: TP.InputBindingPlugin<
	string,
	string,
	StringGroupListInputParams
> = {
	id: 'input-grouplist',
	type: 'input',
	accept: (value, params) => {
		if (typeof value !== 'string') {
			return null;
		}
		const p = TP.ParamsParsers;
		const result = TP.parseParams<StringGroupListInputParams>(params, {
			optgroups: p.required.custom<GroupListParamsOptgroups<string>>(parseGroupListOptgroups),
			view: p.required.constant('grouplist')
		});
		return result
			? {
					initialValue: value,
					params: result
			  }
			: null;
	},
	binding: {
		reader: (_args) => TP.stringFromUnknown,
		constraint: (args) => createConstraint(args.params),
		writer: (_args) => TP.writePrimitive
	},
	controller: (args) => {
		const doc = args.document;
		const value = args.value;
		const c = args.constraint;

		return new GroupListController(doc, {
			props: TP.ValueMap.fromObject({
				optgroups: findGroupListItems(c) ?? []
			}),
			value: value,
			viewProps: args.viewProps
		});
	}
};
