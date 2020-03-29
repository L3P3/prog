export const DEBUG = true;

export function assert(cond) {
	if (!DEBUG)
		return;
	if (cond)
		return;
	throw new Error('assertion fail');
}