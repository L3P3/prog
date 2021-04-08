import {
	hook_callback,
	hook_effect,
	hook_memo,
	hook_reducer_f,
} from './lui.js';

import {cursor_set} from '../ui/cursormask.js';

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

let hook_mouse_current_move = null;
let hook_mouse_current_up = hook_mouse_current_move;
let hook_mouse_current_deps = hook_mouse_current_move;
let hook_mouse_current_x = 0;
let hook_mouse_current_y = 0;
let hook_mouse_current_xi = 0;
let hook_mouse_current_yi = 0;
let hook_mouse_current_cursor = '';

/**
	@noinline
*/
const hook_mouse_handle = event => (
	event.preventDefault(),
	hook_mouse_current_x = event.clientX,
	hook_mouse_current_y = event.clientY
)

/**
	@noinline
*/
const hook_mouse_recall = callback => (
	callback(
		hook_mouse_current_x,
		hook_mouse_current_y,
		hook_mouse_current_xi,
		hook_mouse_current_yi,
		...hook_mouse_current_deps
	)
)

/**
	@noinline
*/
const hook_mouse_up = () => (
	hook_mouse_current_up &&
		hook_mouse_recall(hook_mouse_current_up),
	onmousemove =
	onmouseup =
	hook_mouse_current_move =
	hook_mouse_current_up =
	hook_mouse_current_deps = null,
	false
)

const hook_mouse_handler_move = event => (
	hook_mouse_handle(event),
	hook_mouse_recall(hook_mouse_current_move),
	false
)

const hook_mouse_handler_up = event => (
	cursor_set(null),
	hook_mouse_handle(event),
	hook_mouse_up()
)

const hook_mouse_callback = (
	down,
	deps,
	event
) => (
	hook_mouse_handle(event),
	hook_mouse_current_deps &&
		hook_mouse_up(),
	hook_mouse_current_deps = deps,
	hook_mouse_current_xi = hook_mouse_current_x,
	hook_mouse_current_yi = hook_mouse_current_y,
	[
		hook_mouse_current_move,
		hook_mouse_current_up,
		hook_mouse_current_cursor
	] = hook_mouse_recall(down),
	hook_mouse_current_cursor &&
		cursor_set(hook_mouse_current_cursor),
	hook_mouse_current_move && (
		onmousemove = hook_mouse_handler_move
	),
	onmouseup = hook_mouse_handler_up,
	false
)

const hook_mouse_deps = (...deps) => deps;

/**
	For resizing or moving
	@param {Function} down handler returning move and up handler, all getting (x, y, x_initial, y_initial, ...deps)
	@param {Array} deps
*/
export const hook_mouse = (
	down,
	deps
) => (
	deps = hook_memo(hook_mouse_deps, deps),
	hook_callback(hook_mouse_callback, [down, deps])
)

export const map_primitive_id = list => (
	list.map((value, id) => ({
		value,
		id
	}))
)

export const map_object_index = list => (
	list.map((item, index) => ({
		...item,
		index
	}))
)
