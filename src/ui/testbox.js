import {
	hook_dom,
	hook_memo,
	hook_state,
} from '../etc/lui.js';

import {hook_mouse} from '../etc/helpers.js';

const Testbox_down = () => (
	[
		Testbox_move,
		null,
		'grabbing',
	]
)

const Testbox_move = (x, y, xi, yi, pos, pos_set) => (
	pos_set([x - (xi - pos[0]), y - (yi - pos[1])])
)

const colors = ['red', 'green', 'blue'];
const Testbox_color_get = () => (
	colors[Math.round(Math.random() * (colors.length - 1))]
)

export const Testbox = () => {
	const [pos, pos_set] = hook_state([0, 0]);
	hook_dom('div[style=position:fixed;width:100px;height:100px;cursor:grab]', {
		onmousedown: hook_mouse(Testbox_down, [pos, pos_set]),
		S: {
			background: hook_memo(Testbox_color_get),
			transform: `translate3d(${
				pos[0]
			}px,${
				pos[1]
			}px,0)`,
		},
		innerText: 'Hallo, Welt!',
	});
	return null;
}
