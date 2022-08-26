import * as TP from '@tweakpane/core';
import { GroupListConstraint } from './constraint';

import type {
	ArrayStyleGroupListOptgroups,
	GroupListParamsOptgroups,
	ObjectStyleGroupListOptgroups
} from './params';

export function parseGroupListOptgroups<T>(
	value: unknown
): GroupListParamsOptgroups<T> | undefined {
	const p = TP.ParamsParsers;
	if (Array.isArray(value)) {
		return p.required.array(
			p.required.object({
				text: p.required.string,
				value: p.required.array(
					p.required.object({
						text: p.required.string,
						value: p.required.raw as TP.ParamsParser<T>
					})
				)
			})
		)(value).value;
	}
	if (typeof value === 'object') {
		return (p.required.raw as TP.ParamsParser<ObjectStyleGroupListOptgroups<T>>)(value).value;
	}
	return undefined;
}

export function normalizeGroupListOptgroups<T>(
	optgroups: ArrayStyleGroupListOptgroups<T> | ObjectStyleGroupListOptgroups<T>
): TP.ListItem<TP.ListItem<T>[]>[] {
	if (Array.isArray(optgroups) && optgroups.every((optgroup) => Array.isArray(optgroup.value))) {
		return optgroups;
	}

	const objectStyleOptgroups = optgroups as ObjectStyleGroupListOptgroups<T>;
	const items: TP.ListItem<TP.ListItem<T>[]>[] = Object.keys(objectStyleOptgroups).map(
		(groupName) => {
			const groupItems: TP.ListItem<T>[] = [];
			Object.keys(objectStyleOptgroups[groupName]).forEach((text) =>
				groupItems.push({ text: text, value: objectStyleOptgroups[groupName][text] })
			);
			return { text: groupName, value: groupItems };
		}
	);
	return items;
}

export function createGroupListConstraint<T>(
	optgroups: GroupListParamsOptgroups<string> | undefined
) {
	return !TP.isEmpty(optgroups)
		? new GroupListConstraint(normalizeGroupListOptgroups<T>(TP.forceCast(optgroups)))
		: null;
}

export function findGroupListItems<T>(
	constraint: TP.Constraint<T> | undefined
): TP.ListItem<TP.ListItem<T>[]>[] | null {
	const c = constraint
		? TP.findConstraint<GroupListConstraint<T>>(constraint, GroupListConstraint)
		: null;
	if (!c) {
		return null;
	}

	return c.optgroups;
}
