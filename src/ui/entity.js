import {node} from '../etc/lui.js';

import {
	ENTITY,
	VALUE,
	type_color_get,
	entity_get,
	entity_label_get,
	entity_prop_entity_get,
	entity_prop_get_raw,
	entity_prop_native_get,
	entity_prop_text_get,
	entity_prop_value_edit
} from '../etc/entity.js';
import {menu_entity} from './menu/entity.js';

import {Node} from './node.js';

import {
	CMD_MENU_OPEN,
	CMD_TAB_OPEN_ENTITY
} from '../etc/store.js';

const Entity_branch = (
	entity,
	store_dispatch,
	prop
) => {
	const prop_obj = entity_get(prop);
	const prop_obj_type = entity_prop_entity_get(prop_obj, ENTITY.PROP_PROP_TYPE);
	const [color_f, color_b] = type_color_get(
		prop_obj_type[ENTITY.PROP_OBJ_ID][1]
	);

	const [val_type, val_value] = entity_prop_get_raw(entity, prop);

	return {
		id: prop,
		//color: 'white',
		action: null,
		content: node(Node, {columns: [
			{
				color_f,
				color_b,
				action: () => store_dispatch(CMD_TAB_OPEN_ENTITY, prop),
				description: `Eigenschaft vom Typen ${
					entity_label_get(prop_obj_type)
				}${
					entity_prop_native_get(prop_obj, ENTITY.PROP_PROP_NULL)
					?	', optional'
					:	''
				}`,
				id: 0,
				label: entity_label_get(prop_obj)
			},
			{
				color_f,
				color_b,
				action: () => (
					val_type === VALUE.REF
					?	store_dispatch(CMD_TAB_OPEN_ENTITY, val_value)
					:	val_type === VALUE.NAT &&
							entity_prop_value_edit(entity, prop)
				),
				description: (
					val_type === VALUE.REF
					?	'Referenziertes Objekt anzeigen'
					:	val_type === VALUE.NAT
						?	'Wert bearbeiten'
						:	'Dynamisch erzeugter Wert'
				),
				id: 1,
				label: entity_prop_text_get(entity, prop)
			}
		]})
	};
}

export const Entity = ({
	entity,
	store_dispatch
}) => {
	const [color_f, color_b] = type_color_get(
		entity[ENTITY.PROP_OBJ_CLASS][1]
	);

	return [
		node(Node, {
			columns: [{
				action: () => store_dispatch(CMD_MENU_OPEN, menu_entity(entity)),
				color_f,
				color_b,
				description: 'Menü öffnen',
				id: 0,
				label: entity_label_get(entity)
			}],
			branches: (
				Object.keys(entity)
				.map(key =>
					Entity_branch(entity, store_dispatch, Number(key))
				)
			)
		})
	];
}
