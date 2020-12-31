import {
	ENTITY,
	entity_create
} from '../../etc/entity.js';

import {menu_app} from './app.js';
import {menu_entity_open_cls} from './entity_open.js';

import {
	CMD_MENU_OPEN,
	CMD_TAB_CLOSE_ALL
} from '../../etc/store.js';

export const menu_main = (
	{tab},
	store_dispatch
) => [
	'Hauptmenü', [
	[
		'Objekt erstellen',
		() => entity_create(store_dispatch)
	],
	[
		'Objekt öffnen',
		() => (
			store_dispatch(
				CMD_MENU_OPEN,
				menu_entity_open_cls(ENTITY.CLASS_CLASS)
			),
			false
		)
	],
	[
		'Seiten schließen',
		tab.all.length > 0
		?	() => (
				store_dispatch(CMD_TAB_CLOSE_ALL),
				true
			)
		:	null
	],
	[
		'Erweitert',
		() => (
			store_dispatch(CMD_MENU_OPEN, menu_app),
			false
		)
	]
]]
