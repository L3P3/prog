import {
	defer,
	defer_end,
	hook_memo,
} from './lui.js';

import {
	DEBUG,
	assert,
} from './debug.js';
import {hook_subscribe} from './helpers.js';
import {
	CMD_TAB_CLOSE,
	CMD_TAB_OPEN_ENTITY,
} from './store.js';

/**
	@typedef {Object<number, Array>} TYPE_ENTITY
*/

/**
	The ID of known entities
	@enum {number}
*/
export const ENTITY = {
	CLASS_OBJ: 0,
	CLASS_CLASS: 1,
	CLASS_TRAIT: 2,
	CLASS_PROP: 3,
	CLASS_NUM: 4,
	CLASS_BOOL: 5,
	CLASS_INT: 6,
	CLASS_SET: 7,
	CLASS_LIST: 8,
	CLASS_MAP: 9,
	CLASS_TEXT: 10,
	CLASS_FUNCTION: 11,
	CLASS_ENUM: 12,
	CLASS_ENUM_VALUES: 13,
	CLASS_ENUM_VALUE: 14,
	CLASS_OPTIONAL: 15,
	CLASS_OPTIONAL_SOME: 16,
	CLASS_OPTIONAL_NONE: 17,
	CLASS_CHAR: 18,
	CLASS_FUNCTION_PART: 19,

	TRAIT_EDIT: 100,
	TRAIT_CLASSY: 101,
	TRAIT_AS_TEXT: 102,

	PROP_OBJ_ID: 200,
	PROP_OBJ_CLASS: 201,
	PROP_OBJ_HARD: 202,
	PROP_OBJ_LABEL: 203,
	PROP_PROPS: 204,
	PROP_TRAITS: 205,
	PROP_CLASS_PARENT: 206,
	PROP_TRAIT_DEPS: 207,
	PROP_AS_TEXT: 208,
	PROP_PROP_TYPE: 209,
	PROP_PROP_NULL: 210,
	PROP_PROP_OWNER: 211,
	PROP_SET_CONTENT_CLASS: 212,
	PROP_MAP_KEY_CLASS: 213,
	PROP_ENUM_VALUES: 214,
	PROP_FUNCTION_INTERFACE: 215,
};

/**
	Kind of stored value
	@enum {number}
*/
export const VALUE = {
	REF: 0,
	NAT: 1,
	DYN: 2,
};

/**
	Stores all entities
	@type {Map<ENTITY, TYPE_ENTITY>}
*/
const entities = new Map;

const entities_listeners = [];

/**
	Reexecute hooks
*/
const hooks_refresh = () => {
	//console.log('hook_refresh', entities_listeners.length);
	defer();
	for (const item of entities_listeners) item();
	defer_end();
}

/**
	Gets filtered list of entities
	@param {function(TYPE_ENTITY}:boolean=} filter
	@return {Array<ENTITY>}
*/
export const hook_entities = filter => (
	hook_memo(
		entities_list,
		[
			filter,
			hook_subscribe(entities_listeners)
		]
	)
)

/**
	Get entity props
	@param {ENTITY} id
	@return {?TYPE_ENTITY}
*/
export const hook_entity = id => (
	hook_memo(
		entity_get_try,
		[
			id,
			hook_subscribe(entities_listeners)
		]
	)
)

/**
	Get an entity by its ID
	@param {ENTITY} id
	@return {?TYPE_ENTITY}
*/
const entity_get_try = id => (
	DEBUG && assert(id !== undefined),
	entities.get(id) || null
)

/**
	Get an entity by its ID
	@param {ENTITY} id
	@return {TYPE_ENTITY}
*/
const entity_get = id => (
	DEBUG && assert(id !== undefined && entities.has(id)),
	/** @type {TYPE_ENTITY} */ (entity_get_try(id))
)

/**
	Get the default prop value in a class
	@param {ENTITY} cls_id
	@param {ENTITY} prop
	@return {Array}
*/
const cls_prop_get_raw = (cls_id, prop) => {
	//walk down the class tree
	let cls;
	let value;
	do
		if (
			(
				value = (
					cls = entity_get(cls_id)
				)[ENTITY.PROP_PROPS][1][prop]
			) !== undefined
		)
			return value;
	while (
		cls_id !== (
			cls_id = cls[ENTITY.PROP_CLASS_PARENT][1]
		)
	);

	//the object class must be the root of the class tree
	DEBUG && assert(cls_id === ENTITY.CLASS_OBJ);
	
	const prop_entity = entity_get(prop);
	const prop_owner = entity_get(prop_entity[ENTITY.PROP_PROP_OWNER][1]);

	DEBUG && (
		//if not defined in class, it must be coming from a trait
		assert(prop_owner[ENTITY.PROP_OBJ_CLASS][1] === ENTITY.CLASS_TRAIT),
		assert(
			prop_owner[ENTITY.PROP_PROPS][1][prop][1] !== null ||
			entity_prop_native_get(
				prop_entity,
				ENTITY.PROP_PROP_NULL
			)
		)
	);

	return prop_owner[ENTITY.PROP_PROPS][1][prop];
}

/**
	Get the uncomputed prop value of an entity
	@param {TYPE_ENTITY} entity
	@param {ENTITY} prop
	@return {Array}
*/
export const entity_prop_get_raw = (entity, prop) => {
	const value = entity[prop];

	return (
		value !== undefined
		?	value
		:	cls_prop_get_raw(
				entity[ENTITY.PROP_OBJ_CLASS][1],
				prop
			)
	);
}

/**
	Get the computed prop value of an entity
	@param {TYPE_ENTITY} entity
	@param {ENTITY} prop
	@return {Array} native value or entity
*/
const entity_prop_get = (entity, prop) => {
	const [val_type, val_value] = entity_prop_get_raw(entity, prop);

	return (
		val_type === VALUE.REF
		?	[false, entity_get(val_value)]
		:	val_type === VALUE.NAT
			?	[true, val_value]
			:	val_value(entity, prop)
	);
}

/**
	Get the computed native value of an entity prop
	@param {TYPE_ENTITY} entity
	@param {ENTITY} prop
	@return {*} the native value
*/
export const entity_prop_native_get = (entity, prop) => {
	const [native, value] = entity_prop_get(entity, prop);

	DEBUG && assert(native);
	
	return value;
}

/**
	Get the computed referenced object of an entity prop
	@param {TYPE_ENTITY} entity
	@param {ENTITY} prop
	@return {TYPE_ENTITY} the referenced entity
*/
export const entity_prop_entity_get = (entity, prop) => {
	const [native, value] = entity_prop_get(entity, prop);

	DEBUG && assert(!native);
	
	return value;
}

/**
	Checks if a class is implementing a trait
	@param {TYPE_ENTITY} entity
	@param {ENTITY} trait
	@return {boolean}
*/
export const class_check_trait = (cls, trait) => (
	cls[ENTITY.PROP_TRAITS].includes(trait)
)

/**
	Checks if a class is a descendant of a class
	@param {ENTITY} cls_check
	@param {ENTITY} cls_target
	@return {boolean}
*/
const class_check_descendant = (cls_check, cls_target) => {
	//walk down the class tree
	do
		if (cls_check === cls_target)
			return true;
	while (
		cls_check !== (
			cls_check = entity_get(cls_check)[ENTITY.PROP_CLASS_PARENT][1]
		)
	);

	return false;
}

/**
	Checks if an entity is at least indirectly of a class
	@param {TYPE_ENTITY} entity
	@param {ENTITY} cls_target
	@return {boolean}
*/
export const entity_check_class = (entity, cls_target) => (
	class_check_descendant(
		entity[ENTITY.PROP_OBJ_CLASS][1],
		cls_target
	)
)

/**
	Checks if an entity is indirectly implementing a trait
	@param {TYPE_ENTITY} entity
	@param {ENTITY} trait
	@return {boolean}
*/
export const entity_check_trait = (entity, trait) => {
	let cls_id = entity[ENTITY.PROP_OBJ_CLASS][1];
	//walk down the class tree
	do
		if (
			class_check_trait(
				entity = entity_get(cls_id),
				trait
			)
		)
			return true;
	while (
		cls_id !== (
			cls_id = entity[ENTITY.PROP_CLASS_PARENT][1]
		)
	);
	
	return false;
}

/**
	Creates a reference to an entity
	@param {ENTITY} entity
	@return {Array}
*/
export const value_create_ref = entity => [VALUE.REF, entity];

/**
	Creates a native value
	@param {*} value
	@return {Array}
*/
export const value_create_nat = value => [VALUE.NAT, value];

/**
	Creates a native computed value
	@param {function(Array, ENTITY):*} getter gets the parent entity as a value and the used param
	@return {Array}
*/
export const value_create_dyn = getter => [VALUE.DYN, getter];

/**
	Creates a custom entity, interactive
*/
export const entity_create = store_dispatch => {
	const label = prompt(
		'Bezeichnung eingeben:',
		''
	);
	if (label) {
		const id = Date.now();
		const entity = {
			[ENTITY.PROP_OBJ_ID]: value_create_nat(id),
			[ENTITY.PROP_OBJ_CLASS]: value_create_ref(ENTITY.CLASS_OBJ),
			[ENTITY.PROP_OBJ_HARD]: value_create_nat(false),
			[ENTITY.PROP_OBJ_LABEL]: value_create_nat(label)
		};
		entities.set(id, entity);
		hooks_refresh();
		store_dispatch(CMD_TAB_OPEN_ENTITY, id);
		return true;
	}
	return false;
}

/**
	Deletes an entity by its ID
	@param {ENTITY} entity
*/
export const entity_delete = (
	store_dispatch,
	entity
) => {
	DEBUG && assert(entities.has(entity));

	entities.delete(entity);
	store_dispatch(CMD_TAB_CLOSE, 'e' + entity);

	hooks_refresh();
}

/**
	Lists all entities, optional filter function
	@param {function(TYPE_ENTITY):boolean=} filter
	@return {Array<ENTITY>}
*/
const entities_list = filter => {
	if (!filter)
		return Array.from(
			entities.keys()
		);

	const matches = [];
	for (const entity of entities.values())
		if (filter(entity))
			matches.push(
				entity[ENTITY.PROP_OBJ_ID][1]
			);
	return matches;
}

const localStorage_ = localStorage;

/**
	Load all entities from storage
*/
export const entities_load = () => {
	const entities_stored = localStorage_.getItem('entities');
	if (entities_stored)
		for (
			const entity of
			/** @type Array<TYPE_ENTITY> */(
				JSON.parse(entities_stored)
			)
		)
			entities.set(
				entity[ENTITY.PROP_OBJ_ID][1],
				entity
			);
}

/**
	Store all entitites into storage
*/
export const entities_save = () => (
	localStorage_.setItem(
		'entities',
		JSON.stringify(
			entities_list(
				entity => !entity[ENTITY.PROP_OBJ_HARD][1]
			)
			.map(entity_get)
		)
	)
)

/**
	Remove all entities from storage
*/
export const entities_reset = () => (
	localStorage_.removeItem('entities')
)

// UI HELPERS //
/**
	Gets a text representing the value of a property
	@param {TYPE_ENTITY} entity
	@param {ENTITY} prop
	@return {string?}
*/
export const entity_prop_text_get = (entity, prop) => {
	const [native, value] = entity_prop_get(entity, prop);

	if (!native) return entity_label_get(value);

	const prop_type = entity_get(prop)[ENTITY.PROP_PROP_TYPE][1];

	return (
		prop_type === ENTITY.CLASS_BOOL
		?	(value ? '☑ Ja' : '☐ Nein')
		:	prop_type === ENTITY.CLASS_TEXT
		?	`"${value}"`
		:	entity_get(prop_type)[ENTITY.PROP_OBJ_CLASS][1] === ENTITY.CLASS_TRAIT
		?	'[ein Merkmal]'
		:	class_check_descendant(prop_type, ENTITY.CLASS_NUM)
		?	'' + value
		:	class_check_descendant(prop_type, ENTITY.CLASS_MAP)
		?	`[${
				Object.keys(value)
				.map(key => key + ': ...')
				.join(', ')
			}]`
		:	class_check_descendant(prop_type, ENTITY.CLASS_SET)
		?	`[${
			Array.from(value).join(', ')
		}]`
		:	'[nicht anzeigbar]'
	);
}

/**
	Gets a text identifying an entity
	@param {TYPE_ENTITY} entity
	@return {string}
*/
export const entity_label_get = entity => (
	entity_prop_native_get(
		entity,
		ENTITY.PROP_OBJ_LABEL
	) ||
	`[#${
		entity_prop_native_get(
			entity,
			ENTITY.PROP_OBJ_ID
		)
	}]`
)

/**
	Get the CSS color codes for a type
	@param {ENTITY} cls
	@return {Array<string>}
*/
export const type_color_get = type => (
	type === ENTITY.CLASS_CLASS
	?	['white', 'blue']
	:	entity_get(type)[ENTITY.PROP_OBJ_CLASS][1] === ENTITY.CLASS_TRAIT
	?	['yellow', 'green']
	:	class_check_descendant(type, ENTITY.CLASS_BOOL)
	?	['white', 'purple']
	:	class_check_descendant(type, ENTITY.CLASS_NUM)
	?	['white', 'red']
	:	class_check_descendant(type, ENTITY.CLASS_SET)
	?	['black', 'cyan']
	:	['white', 'green']
)

/**
	Edit a value of a prop of an entity
	@param {TYPE_ENTITY} entity
	@param {ENTITY} prop
*/
export const entity_prop_value_edit = (entity, prop) => {
	const entity_obj = entity_get(entity);
	const prop_obj = entity_get(prop);
	const prop_type = prop_obj[ENTITY.PROP_PROP_TYPE][1];

	switch (prop_type) {
		case ENTITY.CLASS_BOOL:
			entity_obj[prop] = value_create_nat(
				!entity_prop_native_get(entity_obj, prop)
			);
			break;
		case ENTITY.CLASS_TEXT: {
			const value_new = prompt(
				entity_label_get(prop_obj) + ':',
				entity_prop_native_get(
					entity_obj,
					prop
				)
			);
			if (value_new !== null)
				entity_obj[prop] = value_create_nat(value_new);
			break;
		}
		default:
			alert('Bearbeitung von Werten dieses Typens (noch) nicht möglich.');
	}

	hooks_refresh();
}

// DEFINE CORE ENTITIES //
/**
	Create a hardcoded entity
	@param {ENTITY} id
	@param {ENTITY} cls
	@param {string} label
	@param {TYPE_ENTITY=} props
*/
const entity_define = (id, cls, label, props = {}) => {
	DEBUG && (
		assert(id !== undefined),
		assert(cls !== undefined)
	);
	entities.set(
		id,
		{
			[ENTITY.PROP_OBJ_ID]: value_create_nat(id),
			[ENTITY.PROP_OBJ_CLASS]: value_create_ref(cls),
			[ENTITY.PROP_OBJ_HARD]: value_create_nat(true),
			[ENTITY.PROP_OBJ_LABEL]: value_create_nat(label),
			...props
		}
	);
}

/**
	Create a hardcoded class
	@param {ENTITY} id
	@param {string} label
	@param {ENTITY} parent
	@param {TYPE_ENTITY=} iprops
	@param {Array<ENTITY>=} traits
*/
const entity_class_define = (id, label, parent, iprops, traits) => {
	DEBUG && (
		assert(id !== undefined),
		assert(parent !== undefined)
	);
	const props = {
		[ENTITY.PROP_CLASS_PARENT]: value_create_ref(parent),
		[ENTITY.PROP_TRAITS]: value_create_nat(traits || [])
	};
	
	if (iprops)
		props[ENTITY.PROP_PROPS] = value_create_nat(iprops);
	
	entity_define(id, ENTITY.CLASS_CLASS, label, props);
}

/**
	Create a hardcoded prop
	@param {ENTITY} id
	@param {string} label
	@param {boolean} nullable
	@param {ENTITY} cls
	@param {ENTITY} owner
*/
const entity_prop_define = (id, label, nullable, type, owner) => {
	DEBUG && (
		assert(id !== undefined),
		assert(type !== undefined)
	);
	entity_define(
		id,
		ENTITY.CLASS_PROP,
		label,
		{
			[ENTITY.PROP_PROP_TYPE]: value_create_ref(type),
			[ENTITY.PROP_PROP_NULL]: value_create_nat(nullable),
			[ENTITY.PROP_PROP_OWNER]: value_create_ref(owner),
		}
	);
}

entity_class_define(
	ENTITY.CLASS_OBJ, 'Objekt', ENTITY.CLASS_OBJ,
	{
		[ENTITY.PROP_OBJ_ID]: value_create_nat(null),
		[ENTITY.PROP_OBJ_CLASS]: value_create_nat(null),
		[ENTITY.PROP_OBJ_HARD]: value_create_nat(false),
		[ENTITY.PROP_OBJ_LABEL]: value_create_nat(null),

		[ENTITY.PROP_AS_TEXT]: value_create_dyn(() => '[an object]')
	},
	[
		ENTITY.TRAIT_AS_TEXT
	]
);
entity_class_define(
	ENTITY.CLASS_CLASS, 'Klasse', ENTITY.CLASS_OBJ,
	{
		[ENTITY.PROP_CLASS_PARENT]: value_create_ref(ENTITY.CLASS_OBJ)
	},
	[
		ENTITY.TRAIT_CLASSY
	]
);
entity_class_define(
	ENTITY.CLASS_TRAIT, 'Merkmal', ENTITY.CLASS_OBJ,
	{
		[ENTITY.PROP_TRAIT_DEPS]: value_create_nat([])
	},
	[
		ENTITY.TRAIT_CLASSY
	]
);
entity_class_define(
	ENTITY.CLASS_PROP, 'Eigenschaft', ENTITY.CLASS_OBJ,
	{
		[ENTITY.PROP_PROP_TYPE]: value_create_ref(ENTITY.CLASS_OBJ),
		[ENTITY.PROP_PROP_NULL]: value_create_nat(false),
		[ENTITY.PROP_PROP_OWNER]: value_create_ref(ENTITY.CLASS_OBJ)
	}
);
entity_class_define(
	ENTITY.CLASS_NUM, 'Zahl', ENTITY.CLASS_OBJ,
	{
		[ENTITY.PROP_AS_TEXT]: value_create_dyn(() => '[a number]')
	},
	[
		ENTITY.TRAIT_AS_TEXT
	]
);
entity_class_define(ENTITY.CLASS_BOOL, 'Wahrheit', ENTITY.CLASS_NUM);
entity_class_define(ENTITY.CLASS_INT, 'Ganzzahl', ENTITY.CLASS_NUM);
entity_class_define(
	ENTITY.CLASS_SET, 'Menge', ENTITY.CLASS_OBJ,
	{
		[ENTITY.PROP_SET_CONTENT_CLASS]: value_create_ref(ENTITY.CLASS_OBJ)
	}
);
entity_class_define(ENTITY.CLASS_LIST, 'Liste', ENTITY.CLASS_SET);
entity_class_define(
	ENTITY.CLASS_MAP, 'Zuordnungsliste', ENTITY.CLASS_SET,
	{
		[ENTITY.PROP_MAP_KEY_CLASS]: value_create_ref(ENTITY.CLASS_OBJ)
	}
);
entity_class_define(ENTITY.CLASS_TEXT, 'Text', ENTITY.CLASS_LIST,
	{
		[ENTITY.PROP_SET_CONTENT_CLASS]: value_create_ref(ENTITY.CLASS_CHAR)
	}
);
entity_class_define(
	ENTITY.CLASS_FUNCTION, 'Funktion', ENTITY.CLASS_SET,
	{
		[ENTITY.PROP_FUNCTION_INTERFACE]: value_create_nat([]),

		[ENTITY.PROP_SET_CONTENT_CLASS]: value_create_ref(ENTITY.CLASS_FUNCTION_PART)
	}
);
entity_class_define(ENTITY.CLASS_ENUM, 'Auswahl', ENTITY.CLASS_OBJ,
	{
		[ENTITY.PROP_ENUM_VALUES]: value_create_nat([])
	}
);
entity_class_define(ENTITY.CLASS_ENUM_VALUES, 'Auswahl-Möglichkeiten', ENTITY.CLASS_SET,
	{
		[ENTITY.PROP_SET_CONTENT_CLASS]: value_create_ref(ENTITY.CLASS_ENUM_VALUE)
	}
);
entity_class_define(ENTITY.CLASS_ENUM_VALUE, 'Auswahl-Möglichkeit', ENTITY.CLASS_OBJ);
entity_class_define(
	ENTITY.CLASS_OPTIONAL, 'Optionaler Wert', ENTITY.CLASS_ENUM,
	{
		[ENTITY.PROP_ENUM_VALUES]: value_create_nat([ENTITY.CLASS_OPTIONAL_SOME, ENTITY.CLASS_OPTIONAL_NONE])
	}
);
entity_class_define(ENTITY.CLASS_CHAR, 'Zeichen', ENTITY.CLASS_ENUM);
entity_class_define(ENTITY.CLASS_FUNCTION_PART, 'Funktionsteil', ENTITY.CLASS_ENUM);

entity_define(ENTITY.TRAIT_EDIT, ENTITY.CLASS_TRAIT, 'Bearbeitbar');
entity_define(
	ENTITY.TRAIT_CLASSY, ENTITY.CLASS_TRAIT, 'Klassisch',
	{
		[ENTITY.PROP_PROPS]: value_create_nat({
			[ENTITY.PROP_PROPS]: value_create_nat({}),
			[ENTITY.PROP_TRAITS]: value_create_nat([])
		})
	}
);
entity_define(
	ENTITY.TRAIT_AS_TEXT, ENTITY.CLASS_TRAIT, 'Ausschreibbar',
	{
		[ENTITY.PROP_PROPS]: value_create_nat({
			[ENTITY.PROP_AS_TEXT]: value_create_nat(null)
		})
	}
);

entity_define(ENTITY.CLASS_OPTIONAL_SOME, ENTITY.CLASS_ENUM_VALUE, 'Etwas');
entity_define(ENTITY.CLASS_OPTIONAL_NONE, ENTITY.CLASS_ENUM_VALUE, 'Nichts');

entity_prop_define(ENTITY.PROP_OBJ_ID, 'ID', false, ENTITY.CLASS_INT, ENTITY.CLASS_OBJ);
entity_prop_define(ENTITY.PROP_OBJ_CLASS, 'Klasse', false, ENTITY.CLASS_CLASS, ENTITY.CLASS_OBJ);
entity_prop_define(ENTITY.PROP_OBJ_HARD, 'Geschützt', false, ENTITY.CLASS_BOOL, ENTITY.CLASS_OBJ);
entity_prop_define(ENTITY.PROP_OBJ_LABEL, 'Bezeichnung', true, ENTITY.CLASS_TEXT, ENTITY.CLASS_OBJ);
entity_prop_define(ENTITY.PROP_PROPS, 'Eigenschaften', false, ENTITY.CLASS_MAP, ENTITY.TRAIT_CLASSY);
entity_prop_define(ENTITY.PROP_TRAITS, 'Merkmale', false, ENTITY.CLASS_SET, ENTITY.TRAIT_CLASSY);
entity_prop_define(ENTITY.PROP_CLASS_PARENT, 'Eltern-Klasse', false, ENTITY.CLASS_CLASS, ENTITY.CLASS_CLASS);
entity_prop_define(ENTITY.PROP_TRAIT_DEPS, 'Abhängigkeiten', false, ENTITY.CLASS_SET, ENTITY.CLASS_TRAIT);
entity_prop_define(ENTITY.PROP_AS_TEXT, 'Text-Repräsentation', false, ENTITY.CLASS_TEXT, ENTITY.TRAIT_AS_TEXT);
entity_prop_define(ENTITY.PROP_PROP_TYPE, 'Wert-Typ', false, ENTITY.TRAIT_CLASSY, ENTITY.CLASS_PROP);
entity_prop_define(ENTITY.PROP_PROP_NULL, 'Erratbar', false, ENTITY.CLASS_BOOL, ENTITY.CLASS_PROP);
entity_prop_define(ENTITY.PROP_PROP_OWNER, 'Ursprung', false, ENTITY.TRAIT_CLASSY, ENTITY.CLASS_PROP);
entity_prop_define(ENTITY.PROP_SET_CONTENT_CLASS, 'Element-Klasse', false, ENTITY.CLASS_CLASS, ENTITY.CLASS_SET);
entity_prop_define(ENTITY.PROP_MAP_KEY_CLASS, 'Schlüssel-Klasse', false, ENTITY.CLASS_CLASS, ENTITY.CLASS_MAP);
entity_prop_define(ENTITY.PROP_ENUM_VALUES, 'Auswahl-Möglichkeiten', false, ENTITY.CLASS_ENUM_VALUES, ENTITY.CLASS_ENUM);
entity_prop_define(ENTITY.PROP_FUNCTION_INTERFACE, 'Schnittstelle', false, ENTITY.CLASS_SET, ENTITY.CLASS_FUNCTION);
