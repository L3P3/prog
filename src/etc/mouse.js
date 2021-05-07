import {
	hook_callback,
	hook_memo,
} from './lui.js';

import {cursor_set} from '../ui/cursormask.js';

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
