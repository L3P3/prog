import {
	ENTITY,
	entity_delete,
	entity_get,
	entity_label_get
} from '../../etc/entity.js';

export const menu_entity = entity => [
	entity_label_get(entity),
	[
		[
			'Typ: ' +
			entity_label_get(
				entity_get(
					entity[ENTITY.PROP_OBJ_CLASS]
				)
			)
		],
		[
			'Löschen',
			(
				entity[ENTITY.PROP_OBJ_HARD]
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
				entity[ENTITY.PROP_LABEL] || ''
			);
			if (label)
				entity[ENTITY.PROP_LABEL] = label;
		},
		'Umbenennen'
	]
];