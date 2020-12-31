import {
	ENTITY,
	entities_list,
	entity_get,
	entity_label_get
} from '../../etc/entity.js';

import {
	CMD_MENU_OPEN,
	CMD_TAB_OPEN_ENTITY
} from '../../etc/store.js';

export const menu_entity_open_cls = cls => (
	_,
	store_dispatch
) => [
	'Instanzen von ' +
	entity_label_get(
		entity_get(cls)
	),
	(
		entities_list(entity =>
			entity[ENTITY.PROP_OBJ_CLASS][1] === cls
		)
		.map(entity => [
			entity_label_get(entity),
			entity[ENTITY.PROP_OBJ_ID][1] !== cls
			?	() => (
					cls === ENTITY.CLASS_CLASS
					?	(
							store_dispatch(
								CMD_MENU_OPEN,
								menu_entity_open_cls(entity[ENTITY.PROP_OBJ_ID][1])
							),
							false
						)
					:	(
							store_dispatch(
								CMD_TAB_OPEN_ENTITY,
								entity[ENTITY.PROP_OBJ_ID][1]
							),
							true
						)
				)
			:	null
		])
	),
	[
		'♣',
		() => (
			store_dispatch(CMD_TAB_OPEN_ENTITY, cls),
			true
		),
		'Klasse anzeigen'
	]
]
