import {
	hook_assert,
	hook_map,
	hook_memo,
	node,
} from '../etc/lui.js';

import {
	VALUE,
	entity_label_get,
	entity_prop_get_raw,
	entity_prop_text_get,
	entity_prop_value_edit,
	hook_entity,
} from '../etc/entity.js';
import {CMD_TAB_OPEN_ENTITY} from '../etc/store.js';

import {Table} from './table.js';

const Entity_prop = (
	prop,
	entity
) => {
	const entity_obj = hook_entity(entity);

	const [val_type, val_value] = entity_prop_get_raw(entity_obj, prop);

	return {
		fields: [
			entity_label_get(hook_entity(prop)),
			entity_prop_text_get(entity_obj, prop),
			entity_label_get(entity_obj),
		],
		id: prop,
		val_type,
		val_value,
	};
}

const Entity_columns_get = (
	entity,
	store_dispatch
) => [
	{
		action: (_, record) => (
			store_dispatch(CMD_TAB_OPEN_ENTITY, record.id)
		),
		label: 'Eigenschaft',
		id: 'a',
		hint: 'Eigenschafts-Objekt anzeigen',
	},
	{
		action: (_, record) => (
			record.val_type === VALUE.REF
			?	store_dispatch(CMD_TAB_OPEN_ENTITY, record.val_value)
			:	record.val_type === VALUE.NAT &&
					entity_prop_value_edit(entity, record.id)
		),
		label: 'Wert',
		id: entity + 'b',
		hint: 'Wert bearbeiten oder referenziertes Objekt anzeigen',
	},
	{
		label: 'Ursprung',
		id: 'c',
		hint: 'Nächste Klasse/Instanz, in der dieser Wert gesetzt ist',
	},
]

const Entity_props = entity_obj => (
	Object.keys(entity_obj).map(Number)
)

export const Entity = ({
	entity,
	store_dispatch
}) => {
	const entity_obj = hook_entity(entity);
	hook_assert(entity_obj);

	return [
		node(Table, {
			columns: hook_memo(Entity_columns_get, [entity, store_dispatch]),
			records: hook_map(
				Entity_prop,
				hook_memo(Entity_props, [entity_obj, entity]),
				[entity]
			),
		})
	];
}
