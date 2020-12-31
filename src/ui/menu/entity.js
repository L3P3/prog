import {
	ENTITY,
	entity_delete,
	entity_label_get
} from '../../etc/entity.js';

export const menu_entity = entity => (
	_,
	store_dispatch
) => [
	entity_label_get(entity),
	[
		[
			'Löschen',
			entity[ENTITY.PROP_OBJ_HARD][1]
			?	null
			:	() => (
					confirm('Objekt löschen?') && (
						entity_delete(store_dispatch, entity[ENTITY.PROP_OBJ_ID][1]),
						true
					)
				)
		]
	]
]
