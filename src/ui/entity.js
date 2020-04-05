import {
	ENTITY,
	VALUE,
	cls_color_get,
	entity_get,
	entity_label_get,
	entity_prop_entity_get,
	entity_prop_get_raw,
	entity_prop_native_get,
	entity_prop_text_get,
	entity_prop_value_edit
} from '../etc/entity.js';

import {menu_entity} from './menu/entity.js';
import {menu_open} from './menu.js';
import {node_component} from './node.js';
import {tab_entity_open} from './tab.js';

/** @type {TYPE_COMPONENT} */
export const entity_component = {
	view: ({attrs: {entity}}) => {
		const [color_f, color_b] = cls_color_get(
			entity[ENTITY.PROP_OBJ_CLASS][1]
		);

		return m(
			node_component,
			{
				columns: [
					{
						color_f,
						color_b,
						action: () => {
							menu_open(
								() => menu_entity(entity)
							);
						},
						description: 'Menü öffnen',
						label: entity_label_get(entity),
					}
				],
				branches: (
					Object.keys(entity)
					.map(key => Number(key))
					.map(prop => {
						const prop_obj = entity_get(prop);
						const prop_obj_cls = entity_prop_entity_get(prop_obj, ENTITY.PROP_PROP_CLASS);
						const prop_obj_cls_id = prop_obj_cls[ENTITY.PROP_OBJ_ID][1];
						const [color_f, color_b] = cls_color_get(prop_obj_cls_id);

						const [val_type, val_value] = entity_prop_get_raw(entity, prop);

						return {
							//color: 'white',
							action: null,
							content: m(
								node_component,
								{
									columns: [
										{
											color_f,
											color_b,
											action: () => tab_entity_open(prop),
											description: `Eigenschaft vom Typen ${
												entity_label_get(prop_obj_cls)
											}${
												entity_prop_native_get(prop_obj, ENTITY.PROP_PROP_NULL)
												?	', optional'
												:	''
											}`,
											label: entity_label_get(prop_obj)
										},
										{
											color_f,
											color_b,
											action: (
												val_type === VALUE.REF
												?	() => tab_entity_open(val_value)
												:	val_type === VALUE.NAT
													?	() => entity_prop_value_edit(entity, prop)
													:	null
											),
											description: (
												val_type === VALUE.REF
												?	'Referenziertes Objekt anzeigen'
												:	val_type === VALUE.NAT
													?	'Wert bearbeiten'
													:	'Dynamisch erzeugter Wert'
											),
											label: (
												entity_prop_text_get(
													entity,
													prop
												)
											)
										}
									]
								}
							)
						};
					})
				)
			}
		)
	}
};