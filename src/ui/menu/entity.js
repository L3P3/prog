import {
	ENTITY,
	entity_delete,
	entity_label_get,
	entity_prop_native_get,
	value_create_nat
} from '../../etc/entity.js';

export const menu_entity = entity => [
	entity_label_get(entity),
	[
		[
			'Löschen',
			(
				entity[ENTITY.PROP_OBJ_HARD][1]
				? null
				: () => (
					confirm('Objekt löschen?') &&
					(entity_delete(entity), true)
				)
			)
		]
	],
	[
		'✏',
		() => {
			const label = prompt(
				'Neue Bezeichnung eingeben:',
				entity_prop_native_get(entity, ENTITY.PROP_OBJ_LABEL) || ''
			);
			if (label)
				entity[ENTITY.PROP_OBJ_LABEL] = value_create_nat(label);
		},
		'Umbenennen'
	]
];