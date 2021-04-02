import {
	hook_map,
	node,
} from '../etc/lui.js';

import {
	ENTITY,
	VALUE,
	type_color_get,
	entity_label_get,
	entity_prop_entity_get,
	entity_prop_get_raw,
	entity_prop_native_get,
	entity_prop_text_get,
	entity_prop_value_edit,
	hook_entity,
} from '../etc/entity.js';
import {menu_entity} from './menu/entity.js';

import {Node} from './node.js';

import {
	CMD_MENU_OPEN,
	CMD_TAB_OPEN_ENTITY,
} from '../etc/store.js';

const Entity_branch = (
	prop,
	entity,
	store_dispatch
) => {
	const entity_obj = hook_entity(entity);
	const prop_obj = hook_entity(prop);
	const prop_obj_type = entity_prop_entity_get(prop_obj, ENTITY.PROP_PROP_TYPE);
	const [color, color_b] = type_color_get(
		prop_obj_type[ENTITY.PROP_OBJ_ID][1]
	);

	const [val_type, val_value] = entity_prop_get_raw(entity_obj, prop);

	return {
		action: null,
		//color: 'white',
		content: node(Node, {columns: [
			{
				action: () => store_dispatch(CMD_TAB_OPEN_ENTITY, prop),
				color,
				color_b,
				hint: `Eigenschaft vom Typen ${
					entity_label_get(prop_obj_type)
				}${
					entity_prop_native_get(prop_obj, ENTITY.PROP_PROP_NULL)
					?	', optional'
					:	''
				}`,
				id: 0,
				label: entity_label_get(prop_obj),
			},
			{
				action: () => (
					val_type === VALUE.REF
					?	store_dispatch(CMD_TAB_OPEN_ENTITY, val_value)
					:	val_type === VALUE.NAT &&
							entity_prop_value_edit(entity, prop)
				),
				color,
				color_b,
				hint: (
					val_type === VALUE.REF
					?	'Referenziertes Objekt anzeigen'
					:	val_type === VALUE.NAT
						?	'Wert bearbeiten'
						:	'Dynamisch erzeugter Wert'
				),
				id: 1,
				label: entity_prop_text_get(entity_obj, prop),
			},
		]}),
		id: prop,
	};
}

export const Entity = ({
	entity,
	store_dispatch
}) => {
	const entity_obj = hook_entity(entity);
	const [color_f, color_b] = type_color_get(
		entity_obj[ENTITY.PROP_OBJ_CLASS][1]
	);

	return Node({
		columns: [{
			action: () => store_dispatch(CMD_MENU_OPEN, menu_entity(entity)),
			color_b,
			color_f,
			description: 'Menü öffnen',
			id: 0,
			label: entity_label_get(entity_obj),
		}],
		branches: hook_map(
			Entity_branch,
			Object.keys(entity_obj).map(Number),
			[entity, store_dispatch]
		),
	});
}
