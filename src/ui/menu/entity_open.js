import {
	ENTITY,
	entities_list,
	entity_get,
	entity_label_get
} from '../../etc/entity.js';

import {menu_open} from '../menu.js';
import {tab_entity_open} from '../tab.js';

export const menu_entity_open = () => [
	'Klassen',
	(
		entities_list(entity =>
			entity[ENTITY.PROP_OBJ_ID][1] !== ENTITY.CLASS_CLASS &&
			entity[ENTITY.PROP_OBJ_CLASS][1] === ENTITY.CLASS_CLASS
		)
		.map(entity => [
			entity_label_get(entity),
			() => {
				menu_open(
					() => menu_entity_open_class(
						entity[ENTITY.PROP_OBJ_ID][1]
					)
				);
			}
		])
	),
	[
		'♣',
		() => (tab_entity_open(ENTITY.CLASS_CLASS), true),
		'Klasse der Klassen anzeigen'
	]
];

const menu_entity_open_class = cls => [
	'Vom Typ ' +
	entity_label_get(
		entity_get(cls)
	),
	(
		entities_list(entity =>
			entity[ENTITY.PROP_OBJ_CLASS][1] === cls
		)
		.map(entity => [
			entity_label_get(entity),
			() => (tab_entity_open(entity[ENTITY.PROP_OBJ_ID][1]), true)
		])
	),
	[
		'♣',
		() => (tab_entity_open(cls), true),
		'Klasse anzeigen'
	]
];