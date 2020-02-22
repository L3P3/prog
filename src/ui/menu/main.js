import {entity_create} from '../../etc/entity.js';

import {menu_open} from '../menu.js';
import {menu_app} from './app.js';
import {menu_entity_open} from './entity_open.js';
import {
	tabs,
	tabs_close
} from '../tab.js';

export const menu_main = () => [
	'Hauptmenü',
	[
		[
			'Objekt erstellen',
			entity_create
		],
		[
			'Objekt öffnen',
			() => {
				menu_open(menu_entity_open);
			}
		],
		[
			'Seiten schließen',
			(
				tabs.length > 0
				? () => (tabs_close(), true)
				: null
			)
		],
		[
			'Erweitert',
			() => {
				menu_open(menu_app);
			}
		]
	]
];