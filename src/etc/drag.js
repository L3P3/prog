import {hook_callback} from './lui.js';

import {cursor_set} from '../ui/cursormask.js';

let drag_current_move = null;
let drag_current_up = drag_current_move;
let drag_current_deps = drag_current_move;
let drag_current_x = 0;
let drag_current_y = 0;
let drag_current_xi = 0;
let drag_current_yi = 0;
let drag_current_cursor = '';

const handler_options = {passive: false};

/**
	@param {boolean} touch
	@noinline
*/
const drag_handle = (event, touch) => (
	event.preventDefault(),
	touch && (
		event = event.changedTouches[0]
	),
	drag_current_x = event.clientX,
	drag_current_y = event.clientY
)

/**
	@noinline
*/
const drag_recall = callback => (
	callback(
		drag_current_x,
		drag_current_y,
		drag_current_xi,
		drag_current_yi,
		...drag_current_deps
	)
)

/**
	@noinline
*/
const drag_up = () => (
	drag_current_up &&
		drag_recall(drag_current_up),
	removeEventListener('touchmove', handler_touch_move),
	removeEventListener('touchend', handler_touch_end),
	onmousemove =
	onmouseup =
	drag_current_move =
	drag_current_up =
	drag_current_deps = null,
	false
)

const handler_touch_move = event => (
	drag_handle(event, true),
	drag_recall(drag_current_move),
	false
)

const handler_touch_end = event => (
	drag_handle(event, true),
	drag_up()
)

const handler_mouse_move = event => (
	drag_handle(event, false),
	drag_recall(drag_current_move),
	false
)

const handler_mouse_end = event => (
	cursor_set(null),
	drag_handle(event, false),
	drag_up()
)

const drag_callback = (
	down,
	deps,
	event
) => {
	drag_current_deps &&
		drag_up();

	const touch = event.type === 'touchstart';

	drag_handle(event, touch);

	drag_current_deps = deps;
	drag_current_xi = drag_current_x;
	drag_current_yi = drag_current_y;

	[
		drag_current_move,
		drag_current_up,
		drag_current_cursor
	] = drag_recall(down);

	if (touch) {
		drag_current_move &&
			addEventListener(
				'touchmove',
				handler_touch_move,
				handler_options
			);
		addEventListener(
			'touchend',
			handler_touch_end,
			handler_options
		);
	}
	else {
		drag_current_cursor &&
			cursor_set(drag_current_cursor);
		drag_current_move && (
			onmousemove = handler_mouse_move
		);
		onmouseup = handler_mouse_end;
	}
	return false;
}

/**
	For resizing or moving
	@param {Function} down handler returning move and up handler, all getting (x, y, x_initial, y_initial, ...deps)
	@param {Array} deps
	@return {!Object<string, function>}
*/
export const hook_drag = (
	down,
	deps
) => ({
	onmousedown: (
		down = hook_callback(drag_callback, [down, deps])
	),
	ontouchstart: down,
})
