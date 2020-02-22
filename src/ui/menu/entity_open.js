import {
	entities_list,
	entity_label_get
} from '../../etc/entity.js';

import {tab_entity_open} from '../tab.js';

export const menu_entity_open = () => [
	'Alle Objekte',
	(
		entities_list()
		.map(entity => [
			entity_label_get(entity),
			() => (tab_entity_open(entity), true)
		])
	)
];