import {
	hook_assert,
	hook_dom,
	hook_sub,
	node,
	node_dom,
	node_map,
} from '../etc/lui.js';

import {
	CMD_MENU_BACK,
	CMD_MENU_CLOSE,
} from '../etc/store.js';

const MenuEntry = ({
	store_dispatch,
	I: {
		action,
		label,
	},
}) => (
	hook_dom('div', {
		F: {
			action,
		},
		innerText: label,
		onclick: (
			action
			?	() => (
					action() &&
						store_dispatch(CMD_MENU_CLOSE)
				)
			:	null
		),
	}),
	null
)

const MenuEntries = ({
	entries,
	store_dispatch,
}) => (
	hook_dom('div[className=menu_entries]'),
	[
		node_map(MenuEntry, (
			entries
			.reduce(
				(arr, entry, index) => (
					entry &&
						arr.push({
							id: index,
							action: entry[1],
							label: entry[0],
						}),
					arr
				),
				[]
			)
		), {
			store_dispatch,
		}),
	]
)

export const Menu = ({
	store,
	store_dispatch,
}) => {
	const {menu_stack} = store;

	hook_assert(menu_stack.length > 0);

	const [title, entries, extra] = hook_sub(
		menu_stack[menu_stack.length - 1],
		[store_dispatch, store]
	);

	return [
		node_dom('div[className=menu]', null, [
			node_dom('div[className=bar]', null, [
				node_dom('div[className=bar_button][innerText=◀][title=Zurück]', {
					onclick: () => (
						store_dispatch(CMD_MENU_BACK)
					),
				}),
				node_dom('div[className=menu_title]', {
					innerText: title,
				}),
				extra &&
				node_dom('div[className=bar_button]', {
					innerText: extra[0],
					onclick: (
						extra[1]
						?	() => (
								extra[1]() &&
									store_dispatch(CMD_MENU_CLOSE)
							)
						:	null
					),
					title: extra[2] || null,
				})
			]),
			node(MenuEntries, {
				entries,
				store_dispatch,
			}),
		]),
	];
}
