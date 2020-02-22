const localStorage_ = localStorage;

import {
	tab_entity_close,
	tab_entity_create
} from '../ui/tab.js';

/** @enum {number} */
export const ENTITY = {
	CLASS_OBJ: 0,
	CLASS_CLASS: 1,
	CLASS_TRAIT: 2,
	CLASS_PROP: 3,
	CLASS_NUM: 4,
	CLASS_ENUM: 5,

	TRAIT_EDIT: 100,
	TRAIT_LABEL: 101,
	TRAIT_TRAIT: 102,
	TRAIT_CT_TEXT: 103,

	PROP_OBJ_ID: 200,
	PROP_OBJ_CLASS: 201,
	PROP_OBJ_HARD: 202,
	PROP_LABEL: 203,
	PROP_PROPS: 204,
	PROP_PROPS_F: 205,
	PROP_TRAITS: 206,
	PROP_CLASS_PARENT: 207,
	PROP_TRAIT_DEPS: 208,
	PROP_TO_TEXT: 209,
	PROP_PROP_CLASS: 210,
	PROP_PROP_NULL: 211,
	PROP_PROP_NATIVE: 212
};

export const entities = new Map();
const prop_owners = {};

export const entity_get = id => (
	entities.get(id)
);
export const entity_prop_get = (entity, prop) => {
	if (prop in entity)
		return entity[prop];
	
	let cls_id_before;
	let cls_id = entity[ENTITY.PROP_OBJ_CLASS];
	do {
		const cls = entity_get(cls_id);
		if (
			ENTITY.PROP_PROPS in cls &&
			prop in cls[ENTITY.PROP_PROPS]
		)
			return cls[ENTITY.PROP_PROPS][prop];
		if (
			ENTITY.PROP_PROPS_F in cls &&
			prop in cls[ENTITY.PROP_PROPS_F]
		)
			return cls[ENTITY.PROP_PROPS_F][prop];
		
		cls_id_before = cls_id;
		cls_id =
			(ENTITY.PROP_CLASS_PARENT in cls)
			? cls[ENTITY.PROP_CLASS_PARENT]
			: ENTITY.CLASS_OBJ;
	}
	while (cls_id !== cls_id_before);
	
	if (prop in prop_owners) {
		const prop_owner = entity_get(prop_owners[prop]);
		if (prop_owner[ENTITY.PROP_OBJ_CLASS] === ENTITY.CLASS_TRAIT) {
			const trait_value = prop_owner[ENTITY.PROP_PROPS][prop];
			if (
				trait_value !== null ||
				entity_prop_get(
					entity_get(prop),
					ENTITY.PROP_PROP_NULL
				)
			)
				return trait_value;
			alert('prop has no value: ' + prop);
		}
		else
			alert('prop has invalid owner: ' + prop);
	}
	else
		alert('prop has no owner: ' + prop);
}
export const prop_to_text = (prop, value) => (
	entity_get(value)
	? entity_prop_get(entity_get(value), ENTITY.PROP_TO_TEXT)(entity_get(value))
	: String(value)
);
export const entity_label_get = entity => (
	entity[ENTITY.PROP_LABEL] ||
	'[unbenannt]'
);
export const entity_create = () => {
	const label = prompt(
		'Bezeichnung eingeben:',
		''
	);
	if (label) {
		const id = Date.now();
		const entity = {
			[ENTITY.PROP_OBJ_ID]: id,
			[ENTITY.PROP_OBJ_CLASS]: ENTITY.CLASS_OBJ,
			[ENTITY.PROP_OBJ_HARD]: false,
			[ENTITY.PROP_LABEL]: label
		};
		entities.set(id, entity);
		tab_entity_create(entity);
		return true;
	}
};
export const entity_delete = entity => {
	entities.delete(entity);
	tab_entity_close(entity);
};

export const entities_list = () => (
	Array.from(
		entities.values()
	)
);
export const entities_load = () => {
	const entities_stored = localStorage_.getItem('entities');
	if (entities_stored)
		for (const entity of JSON.parse(entities_stored))
			entities.set(
				entity[ENTITY.PROP_OBJ_ID],
				entity
			);
};
export const entities_save = () => {
	localStorage_.setItem(
		'entities',
		JSON.stringify(
			entities_list()
			.filter(entity =>
				!entity[ENTITY.PROP_OBJ_HARD]
			)
		)
	);
};
export const entities_reset = () => {
	localStorage_.removeItem('entities');
};

// DEFINE CORE ENTITIES //
const entity_define = (id, cls, label, props = {}) => {
	if (
		(
			cls === ENTITY.CLASS_CLASS ||
			cls === ENTITY.CLASS_TRAIT
		) &&
		props[ENTITY.PROP_PROPS]
	)
		for (const key of Object.keys(props[ENTITY.PROP_PROPS]))
			prop_owners[key] = id;
	
	entities.set(
		id,
		{
			[ENTITY.PROP_OBJ_ID]: id,
			[ENTITY.PROP_OBJ_CLASS]: cls,
			[ENTITY.PROP_OBJ_HARD]: true,
			[ENTITY.PROP_LABEL]: label,
			...props
		}
	);
};
const entity_class_define = (id, label, props_o, traits, parent, props_f) => {
	const props = {};
	if (props_o)
		props[ENTITY.PROP_PROPS] = props_o;
	if (traits)
		props[ENTITY.PROP_TRAITS] = traits;
	if (parent)
		props[ENTITY.PROP_CLASS_PARENT] = parent;
	if (props_f)
		props[ENTITY.PROP_PROPS_F] = props_f;
	entity_define(id, ENTITY.CLASS_CLASS, label, props);
};
const entity_prop_define = (id, label, nullable = false) => {
	if (!nullable)
		entity_define(id, ENTITY.CLASS_PROP, label);
	else
		entity_define(id, ENTITY.CLASS_PROP, label, {
			[ENTITY.PROP_PROP_NULL]: true
		});
};

entity_class_define(
	ENTITY.CLASS_OBJ, 'Objekt',
	{
		[ENTITY.PROP_OBJ_ID]: null,
		[ENTITY.PROP_OBJ_CLASS]: null,
		[ENTITY.PROP_OBJ_HARD]: false
	},
	[
		ENTITY.TRAIT_LABEL,
		ENTITY.TRAIT_CT_TEXT
	],
	null,
	{
		[ENTITY.PROP_TO_TEXT]: entity => '#' + entity[ENTITY.PROP_OBJ_ID]
	}
);
entity_class_define(
	ENTITY.CLASS_CLASS, 'Klasse',
	{
		[ENTITY.PROP_CLASS_PARENT]: ENTITY.CLASS_OBJ
	},
	[ENTITY.TRAIT_TRAIT]
);
entity_class_define(
	ENTITY.CLASS_TRAIT, 'Merkmal',
	{
		[ENTITY.PROP_TRAIT_DEPS]: []
	},
	[ENTITY.TRAIT_TRAIT]
);
entity_class_define(
	ENTITY.CLASS_PROP, 'Eigenschaft',
	{
		[ENTITY.PROP_PROP_CLASS]: ENTITY.CLASS_OBJ,
		[ENTITY.PROP_PROP_NULL]: false,
		[ENTITY.PROP_PROP_NATIVE]: true
	}
);
entity_class_define(ENTITY.CLASS_NUM, 'Zahl');
entity_class_define(ENTITY.CLASS_ENUM, 'Möglichkeit');

entity_define(ENTITY.TRAIT_EDIT, ENTITY.CLASS_TRAIT, 'Verwaltbar');
entity_define(ENTITY.TRAIT_LABEL, ENTITY.CLASS_TRAIT, 'Benennbar', {
	[ENTITY.PROP_PROPS]: {
		[ENTITY.PROP_LABEL]: null
	}
});
entity_define(ENTITY.TRAIT_TRAIT, ENTITY.CLASS_TRAIT, 'Merkmalbar', {
	[ENTITY.PROP_PROPS]: {
		[ENTITY.PROP_PROPS]: {},
		[ENTITY.PROP_PROPS_F]: {},
		[ENTITY.PROP_TRAITS]: []
	}
});
entity_define(ENTITY.TRAIT_CT_TEXT, ENTITY.CLASS_TRAIT, 'Ausschreibbar', {
	[ENTITY.PROP_PROPS]: {
		[ENTITY.PROP_TO_TEXT]: null
	}
});

entity_prop_define(ENTITY.PROP_OBJ_ID, 'Objekt-ID');
entity_prop_define(ENTITY.PROP_OBJ_CLASS, 'Klasse');
entity_prop_define(ENTITY.PROP_OBJ_HARD, 'Vorgabe?');
entity_prop_define(ENTITY.PROP_LABEL, 'Bezeichnung', true);
entity_prop_define(ENTITY.PROP_PROPS, 'Eigene Zuweisungen');
entity_prop_define(ENTITY.PROP_PROPS_F, 'Überschriebene Zuweisungen');
entity_prop_define(ENTITY.PROP_TRAITS, 'Merkmale');
entity_prop_define(ENTITY.PROP_CLASS_PARENT, 'Elternklasse');
entity_prop_define(ENTITY.PROP_TRAIT_DEPS, 'Abhängigkeiten');
entity_prop_define(ENTITY.PROP_TO_TEXT, 'Umwandeln in Text');
entity_prop_define(ENTITY.PROP_PROP_CLASS, 'Typ');
entity_prop_define(ENTITY.PROP_PROP_NULL, 'Optional?');
entity_prop_define(ENTITY.PROP_PROP_NATIVE, 'Nativ?');
//entity_prop_define(, '');