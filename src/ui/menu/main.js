import {
	ENTITY,
	entity_create,
} from '../../etc/entity.js';
import {
	CMD_MENU_OPEN,
	CMD_TAB_CLOSE_ALL,
} from '../../etc/store.js';

import {TAB} from '../tab.js';
import {menu_app} from './app.js';
import {menu_entity} from './entity.js';
import {menu_entity_open_cls} from './entity_open.js';

export const menu_main = (
	store_dispatch,
	{tab}
) => {
	const tab_active = (
		tab.active &&
		tab.all.find(item => item.id === tab.active)
	);

	return ['Hauptmenü', [
		tab_active &&
		tab_active.type === TAB.ENTITY &&
		[
			'Objekt-Aktionen',
			() => (
				store_dispatch(
					CMD_MENU_OPEN,
					menu_entity(tab_active.content)
				),
				false
			),
			'Aktionen, die mit dem aktuell geöffneten Objekt ausgeführt werden können',
		],
		[
			'Objekt erstellen',
			() => entity_create(store_dispatch),
		],
		[
			'Objekt öffnen',
			() => (
				store_dispatch(
					CMD_MENU_OPEN,
					menu_entity_open_cls(ENTITY.CLASS_CLASS)
				),
				false
			),
			'Ein bestehendes Objekt auswählen und anzeigen',
		],
		[
			'Seiten schließen',
			tab.all.length > 0
			?	() => (
					store_dispatch(CMD_TAB_CLOSE_ALL),
					true
				)
			:	null,
			'Alle geöffneten Reiter schließen',
		],
		[
			'Erweitert',
			() => (
				store_dispatch(CMD_MENU_OPEN, menu_app),
				false
			),
		],
	]];
}
