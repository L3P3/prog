import {hook_assert} from '../../etc/lui.js';

import {
	ENTITY,
	entity_delete,
	entity_label_get,
	hook_entity,
} from '../../etc/entity.js';

export const menu_entity = entity => (
	store_dispatch
) => {
	const entity_obj = hook_entity(entity);
	hook_assert(entity_obj);

	return [
		entity_label_get(entity_obj),
		[
			[
				'Löschen',
				entity_obj[ENTITY.PROP_OBJ_HARD][1]
				?	null
				:	() => (
						confirm('Objekt löschen?') && (
							entity_delete(store_dispatch, entity),
							true
						)
					),
			],
		],
	];
}
