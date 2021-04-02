import {
	hook_effect,
	hook_reducer_f,
} from './lui.js';

const reducer_count = current => ++current;
const reducer_count_initial = () => 0;

const hook_subscribe_effect_undo = (list, callback) => (
	list.splice(
		list.lastIndexOf(callback),
		1
	)
)

const hook_subscribe_effect = (list, callback) => (
	list.push(callback),
	hook_subscribe_effect_undo
)

/**
	Add rerender callback to list
	@param {Array<Function>} list
*/
export const hook_subscribe = list => {
	const [count, callback] = hook_reducer_f(reducer_count, reducer_count_initial);
	hook_effect(
		hook_subscribe_effect,
		[
			list,
			callback,
		]
	);
	return count;
}
