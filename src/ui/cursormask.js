import {
	hook_first,
	hook_state,
	node_dom,
} from '../etc/lui.js';

import {
	assert,
	DEBUG,
} from '../etc/debug.js';

let cursor, cursor_set_i;
export const cursor_set = cursor => (
	DEBUG && assert(cursor_set_i),
	cursor_set_i(cursor)
)

export const CursorMask = () => (
	DEBUG && assert(!hook_first() || !cursor_set_i),
	[cursor, cursor_set_i] = hook_state(null),
	[
		cursor &&
		node_dom('div[style=position:fixed;width:100%;height:100%;background:transparent]', {
			S: {
				cursor,
			},
		}),
	]
)
