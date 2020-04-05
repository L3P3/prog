import {PROD} from '../env.js';

export const DEBUG = !PROD;

export function assert(cond) {
	if (!DEBUG)
		return;
	if (cond)
		return;
	throw new Error('assertion fail');
}