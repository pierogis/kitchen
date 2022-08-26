export type ArrayStyleGroupListOptgroups<T> = {
	text: string;
	value: { text: string; value: T }[];
}[];
export type ObjectStyleGroupListOptgroups<T> = { [text: string]: { [text: string]: T } };
export type GroupListParamsOptgroups<T> =
	| ArrayStyleGroupListOptgroups<T>
	| ObjectStyleGroupListOptgroups<T>;
