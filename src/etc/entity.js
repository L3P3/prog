const localStorage_ = localStorage;

import {
	DEBUG,
	assert,
} from './debug.js';

import {
	tab_entity_close,
	tab_entity_create,
} from '../ui/tab.js';

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
	CLASS_OPTIONAL: 13,
	CLASS_FUNCTION_PART: 14,

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
	PROP_PROP_CLASS: 209,
	PROP_PROP_NULL: 210,
	PROP_PROP_OWNER: 211,
	PROP_SET_CONTENT_CLASS: 212,
	PROP_MAP_KEY_CLASS: 213,
	PROP_FUNCTION_INTERFACE: 214,
};

/**
	Kind of stored value
	@enum {number}
*/
const VALUE = {
	REF: 0,
	NAT: 1,
	DYN: 2,
};

/**
	Stores all entities
	@type {Map<ENTITY, TYPE_ENTITY>}
*/
export const entities = new Map();

/**
	Get an entity by its ID
	@param {ENTITY} id
	@return {TYPE_ENTITY}
*/
export const entity_get = id => (
	DEBUG && assert(entities.has(id)),
	entities.get(id)
);

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
};

/**
	Get the uncomputed prop value of an entity
	@param {TYPE_ENTITY} entity
	@param {ENTITY} prop
	@return {Array}
*/
const entity_prop_get_raw = (entity, prop) => {
	const value = entity[prop];

	return (
		value !== undefined
		?	value
		:	cls_prop_get_raw(
				entity[ENTITY.PROP_OBJ_CLASS][1],
				prop
			)
	);
};

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
};

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
};

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
};

/**
	Checks if a class is implementing a trait
	@param {TYPE_ENTITY} entity
	@param {ENTITY} trait
	@return {boolean}
*/
export const class_check_trait = (cls, trait) => (
	cls[ENTITY.PROP_TRAITS].includes(trait)
);

/**
	Checks if an entity is at least indirectly of a class
	@param {TYPE_ENTITY} entity
	@param {ENTITY} cls_target
	@return {boolean}
*/
export const entity_check_class = (entity, cls_target) => {
	let cls_id = entity[ENTITY.PROP_OBJ_CLASS][1];
	//walk down the class tree
	do
		if (cls_id === cls_target)
			return true;
	while (
		cls_id !== (
			cls_id = entity_get(cls_id)[ENTITY.PROP_CLASS_PARENT][1]
		)
	);
	
	return false;
};

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
};

/**
	Gets a text representing the value of a property
	@param {TYPE_ENTITY} entity
	@param {ENTITY} prop
	@return {string?}
*/
export const entity_prop_text_get = (entity, prop) => {
	if (entity_check_trait(entity, ENTITY.TRAIT_AS_TEXT)) {
		return '[dynamic text]';
	}
	
	// const text = entity_prop_native_get(
	// 	prop,
	// 	ENTITY.PROP_AS_TEXT
	// );

	const [native, value] = entity_prop_get(entity, prop);

	return (
		native
		?	String(value)
		:	`[${
				entity_label_get(value)
			}]`
	);
};

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
);

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
export const entity_create = () => {
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
		tab_entity_create(entity);
		return true;
	}
};

/**
	Deletes an entity by its ID
	@param {ENTITY} entity
*/
export const entity_delete = entity => {
	DEBUG && assert(entities.has(entity));

	entities.delete(entity);
	tab_entity_close(entity);
};

/**
	Lists all entities, optional filter function
	@param {function(TYPE_ENTITY):boolean=} filter
	@return {Array<TYPE_ENTITY>}
*/
export const entities_list = filter => {
	if (!filter)
		return Array.from(
			entities.values()
		);

	const matches = [];
	for (const entity of entities.values())
		if (filter(entity))
			matches.push(entity);
	return matches;
};

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
};

/**
	Store all entitites into storage
*/
export const entities_save = () => {
	localStorage_.setItem(
		'entities',
		JSON.stringify(
			entities_list()
			.filter(entity =>
				!entity[ENTITY.PROP_OBJ_HARD][1]
			)
		)
	);
};

/**
	Remove all entities from storage
*/
export const entities_reset = () => {
	localStorage_.removeItem('entities');
};

// DEFINE CORE ENTITIES //
/**
	Create a hardwired entity
	@param {ENTITY} id
	@param {ENTITY} cls
	@param {string} label
	@param {TYPE_ENTITY=} props
*/
const entity_define = (id, cls, label, props = {}) => {
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
};

/**
	Create a hardwired class
	@param {ENTITY} id
	@param {string} label
	@param {ENTITY} parent
	@param {TYPE_ENTITY=} iprops
	@param {Array<ENTITY>=} traits
*/
const entity_class_define = (id, label, parent, iprops, traits) => {
	const props = {
		[ENTITY.PROP_CLASS_PARENT]: value_create_ref(parent),
		[ENTITY.PROP_TRAITS]: value_create_nat(traits || [])
	};
	
	if (iprops)
		props[ENTITY.PROP_PROPS] = value_create_nat(iprops);
	
	entity_define(id, ENTITY.CLASS_CLASS, label, props);
};

/**
	Create a hardwired prop
	@param {ENTITY} id
	@param {string} label
	@param {boolean} nullable
	@param {ENTITY} cls
	@param {ENTITY} owner
*/
const entity_prop_define = (id, label, nullable, cls, owner) => {
	entity_define(
		id,
		ENTITY.CLASS_PROP,
		label,
		{
			[ENTITY.PROP_PROP_CLASS]: value_create_ref(cls),
			[ENTITY.PROP_PROP_NULL]: value_create_nat(nullable),
			[ENTITY.PROP_PROP_OWNER]: value_create_ref(owner),
		}
	);
};

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
		[ENTITY.PROP_PROP_CLASS]: value_create_ref(ENTITY.CLASS_OBJ),
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
entity_class_define(ENTITY.CLASS_BOOL, 'Wahrheitswert', ENTITY.CLASS_NUM);
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
entity_class_define(ENTITY.CLASS_TEXT, 'Text', ENTITY.CLASS_SET);
entity_class_define(
	ENTITY.CLASS_FUNCTION, 'Funktion', ENTITY.CLASS_SET,
	{
		[ENTITY.PROP_FUNCTION_INTERFACE]: value_create_nat([]),

		[ENTITY.PROP_SET_CONTENT_CLASS]: value_create_ref(ENTITY.CLASS_FUNCTION_PART)
	}
);
entity_class_define(ENTITY.CLASS_ENUM, 'Möglichkeit', ENTITY.CLASS_OBJ);
entity_class_define(ENTITY.CLASS_OPTIONAL, 'Optionaler Wert', ENTITY.CLASS_ENUM);
entity_class_define(ENTITY.CLASS_FUNCTION_PART, 'Funktionsteil', ENTITY.CLASS_ENUM);

entity_define(ENTITY.TRAIT_EDIT, ENTITY.CLASS_TRAIT, 'Verwaltbar');
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

entity_prop_define(ENTITY.PROP_OBJ_ID, 'Objekt-ID', false, ENTITY.CLASS_INT, ENTITY.CLASS_OBJ);
entity_prop_define(ENTITY.PROP_OBJ_CLASS, 'Klasse', false, ENTITY.CLASS_CLASS, ENTITY.CLASS_OBJ);
entity_prop_define(ENTITY.PROP_OBJ_HARD, 'Vorgegeben', false, ENTITY.CLASS_BOOL, ENTITY.CLASS_OBJ);
entity_prop_define(ENTITY.PROP_OBJ_LABEL, 'Bezeichnung', true, ENTITY.CLASS_TEXT, ENTITY.CLASS_OBJ);
entity_prop_define(ENTITY.PROP_PROPS, 'Instanzeigenschaften', false, ENTITY.CLASS_MAP, ENTITY.TRAIT_CLASSY);
entity_prop_define(ENTITY.PROP_TRAITS, 'Merkmale', false, ENTITY.CLASS_SET, ENTITY.TRAIT_CLASSY);
entity_prop_define(ENTITY.PROP_CLASS_PARENT, 'Elternklasse', false, ENTITY.CLASS_CLASS, ENTITY.CLASS_CLASS);
entity_prop_define(ENTITY.PROP_TRAIT_DEPS, 'Abhängigkeiten', false, ENTITY.CLASS_SET, ENTITY.CLASS_TRAIT);
entity_prop_define(ENTITY.PROP_AS_TEXT, 'Darstellung als Text', false, ENTITY.CLASS_TEXT, ENTITY.TRAIT_AS_TEXT);
entity_prop_define(ENTITY.PROP_PROP_CLASS, 'Typ', false, ENTITY.CLASS_CLASS, ENTITY.CLASS_PROP);
entity_prop_define(ENTITY.PROP_PROP_NULL, 'Optional', false, ENTITY.CLASS_BOOL, ENTITY.CLASS_PROP);
entity_prop_define(ENTITY.PROP_PROP_OWNER, 'Ursprung', false, ENTITY.CLASS_CLASS, ENTITY.CLASS_PROP);
entity_prop_define(ENTITY.PROP_SET_CONTENT_CLASS, 'Inhaltstyp', false, ENTITY.CLASS_CLASS, ENTITY.CLASS_SET);
entity_prop_define(ENTITY.PROP_MAP_KEY_CLASS, 'Schlüsseltyp', false, ENTITY.CLASS_CLASS, ENTITY.CLASS_MAP);
entity_prop_define(ENTITY.PROP_FUNCTION_INTERFACE, 'Schnittstelle', false, ENTITY.CLASS_SET, ENTITY.CLASS_FUNCTION);
