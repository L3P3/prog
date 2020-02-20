// MENU //
const menu_stack = [];
			
const menu_open = menu => {
	menu_stack.push(menu);
};
const menu_back = () => {
	menu_stack.pop();
};
const menu_close = () => {
	menu_stack.length = 0;
};

const menu_view = {
	view: () => {
		if (menu_stack.length === 0) {
			return null;
		}
		const [title, entries, extra] = menu_stack[menu_stack.length - 1]();
		return (
			m(
				'#menu',
				[
					m(
						'.bar',
						[
							m(
								'.bar_button',
								{
									onclick: menu_back,
									title: 'Zurück'
								},
								'◀'
							),
							m(
								'#menu_title',
								title
							),
							extra &&
							m(
								'.bar_button',
								{
									onclick: extra[1] || null,
									title: extra[2] || null
								},
								extra[0]
							)
						]
					),
					m(
						'#menu_entries',
						(
							entries
							.map((entry, index) =>
								entry &&
								m(
									'',
									{
										key: index,
										className: (
											entry[1]
											? 'action'
											: ''
										),
										onclick: (
											entry[1]
											? () => {
												entry[1]() &&
												menu_close();
											}
											: null
										)
									},
									entry[0]
								)
							)
							.filter(Boolean)
						)
					)
				]
			)
		);
	}
};

const action_entity_create = () => {
	const label = prompt(
		'Bezeichnung eingeben:',
		''
	);
	if (label) {
		const id = Date.now();
		const entity = {
			[PROP_OBJ_ID]: id,
			[PROP_OBJ_CLASS]: EC_OBJ,
			[PROP_OBJ_HARD]: false,
			[PROP_LABEL]: label
		};
		entities.set(id, entity);
		tabs.push(tab_active = {
			type: TAB_ENTITY,
			content: entity
		});
		return true;
	}
};

const action_entity_open = entity => {
	tab_active = tabs.find(tab =>
		tab.type === TAB_ENTITY &&
		tab.content === entity
	);
	if (!tab_active)
		tabs.push(tab_active = {
			type: TAB_ENTITY,
			content: entity
		});
	return true;
};

const action_entity_delete = entity => {
	entities.delete(entity);
	const tab = tabs.find(tab =>
		tab.type === TAB_ENTITY &&
		tab.content === entity
	);
	if (tab)
		action_tab_close(tab);
	return true;
};

const action_save = () => {
	const entities_string =
		JSON.stringify(
			Array.from(entities.values())
			.filter(entity =>
				!entity[PROP_OBJ_HARD]
			)
		);
	localStorage.setItem('entities', entities_string);
	return true;
};

const action_tab_close = tab => {
	const index = tabs.indexOf(tab);
	tabs.splice(index, 1);
	if (tab === tab_active)
		tab_active = null;
	return true;
};

const menu_main = () => ['Hauptmenü', [
	['Objekt erstellen', action_entity_create],
	['Objekt öffnen', () => {
		menu_open(menu_entity_open);
	}],
	['Seiten schließen',
		tabs.length > 0
		? () => {
			tabs.length = 0;
			tab_active = null;
			return true;
		}
		: null
	],
	['Erweitert', () => {
		menu_open(menu_app);
	}]
]];

const menu_entity_open = () => ['Alle Objekte', (
	Array.from(entities.values())
	.map(entity => [
		entity_label_get(entity),
		() => action_entity_open(entity)
	])
)];

const menu_app = () => ['Erweitert', [
	['Test', () => {
		alert('Hallo, Welt!');
	}],
	['Alles speichern', action_save],
	['Zurücksetzen', () => {
		if (confirm('Alle Benutzerdaten löschen?')) {
			localStorage.removeItem('entities');
			location.reload();
		}
	}],
	['Grafische Programmierung, ©2020'],
	['95% in DroidEdit, Android 4.4'],
	['5% in Notepad++, Windows XP'],
	['L3P3.de', () => {
		open('//l3p3.de');
	}]
]];

const menu_entity = entity => [
	entity_label_get(entity),
	[
		['Typ: ' + entity_label_get(entity_get(entity[PROP_OBJ_CLASS]))],
		['Löschen',
			entity[PROP_OBJ_HARD]
			? null
			: () => (
				confirm('Objekt löschen?') &&
				action_entity_delete(entity)
			)
		]
	],
	['✏', () => {
		const label = prompt(
			'Neue Bezeichnung eingeben:',
			entity[PROP_LABEL] || ''
		);
		if (label)
			entity[PROP_LABEL] = label;
	}, 'Umbenennen']
];

// TABS //
const TAB_ENTITY = 0;
const TAB_METHOD = 1;

const tabs = [];
let tab_active = null;

const tabs_view = {
	view: () => [
		m(
			'.bar',
			[
				m(
					'.bar_button',
					{
						onclick: () => {
							menu_open(menu_main);
						},
						title: 'Menü öffnen'
					},
					'☰'
				),
				m(
					'#tabs',
					tabs
					.map(tab =>
						m(
							'',
							{
								className: (
									tab === tab_active
									? 'active'
									: ''
								),
								title: entity_label_get(tab.content),
								onclick: (
									tab !== tab_active
									? () => {
											tab_active = tab;
									}
									: null
								)
							},
							entity_label_get(tab.content)
						)
					)
				),
				m(
					'.bar_button',
					{
						onclick: (
							tabs.length > 0
							? () => {
								action_tab_close(tab_active);
							}
							: () => {
								action_entity_create();
							}
						),
						title: (
							tabs.length > 0
							? 'Seite schließen'
							: 'Objekt erstellen'
						)
					},
					(
						tabs.length > 0
						? '×'
						: '+'
					)
				)
			]
		),
		m(
			'#page',
			tab_active
			? m(
				tab_view,
				tab_active
			)
			: m(
				'#page_empty',
				'Kein Objekt ausgewählt.'
			)
		)
	]
};

const tab_view = {
	view: ({attrs}) => {
		switch (attrs.type) {
			case TAB_ENTITY:
				return m(
					tab_view_entity,
					{
						entity: attrs.content
					}
				);
			default:
				return null;
		}
	}
};

// ENTITIES //
const EC_OBJ = 0;
const EC_CLASS = 1;
const EC_TRAIT = 2;
const EC_PROP = 3;
const EC_NUM = 4;
const EC_ENUM = 5;

const ET_EDIT = 100;
const ET_LABEL = 101;
const ET_TRAIT = 102;
const ET_CT_TEXT = 103;

const PROP_OBJ_ID = 200;
const PROP_OBJ_CLASS = 201;
const PROP_OBJ_HARD = 202;
const PROP_LABEL = 203;
const PROP_PROPS = 204;
const PROP_PROPS_F = 205;
const PROP_TRAITS = 206;
const PROP_CLASS_PARENT = 207;
const PROP_TRAIT_DEPS = 208;
const PROP_TO_TEXT = 209;
const PROP_PROP_CLASS = 210;
const PROP_PROP_NULL = 211;
const PROP_PROP_NATIVE = 212;

const entities = new Map();
const prop_owners = {};
const entity_define = (id, cls, label, props = {}) => {
	if (
		(
			cls === EC_CLASS ||
			cls === EC_TRAIT
		) &&
		props[PROP_PROPS]
	)
		for (const key of Object.keys(props[PROP_PROPS]))
			prop_owners[key] = id;
	
	entities.set(
		id,
		{
			[PROP_OBJ_ID]: id,
			[PROP_OBJ_CLASS]: cls,
			[PROP_OBJ_HARD]: true,
			[PROP_LABEL]: label,
			...props
		}
	);
};
const entity_class_define = (id, label, props_o, traits, parent, props_f) => {
	const props = {};
	if (props_o)
		props[PROP_PROPS] = props_o;
	if (traits)
		props[PROP_TRAITS] = traits;
	if (parent)
		props[PROP_CLASS_PARENT] = parent;
	if (props_f)
		props[PROP_PROPS_F] = props_f;
	entity_define(id, EC_CLASS, label, props);
};
const entity_prop_define = (id, label, nullable = false) => {
	if (!nullable)
		entity_define(id, EC_PROP, label);
	else
		entity_define(id, EC_PROP, label, {
			[PROP_PROP_NULL]: true
		});
};
const entity_get = id => (
	entities.get(id)
);
const entity_prop_get = (entity, prop) => {
	if (prop in entity)
		return entity[prop];
	
	let cls_id_before;
	let cls_id = entity[PROP_OBJ_CLASS];
	do {
		const cls = entity_get(cls_id);
		if (
			PROP_PROPS in cls &&
			prop in cls[PROP_PROPS]
		)
			return cls[PROP_PROPS][prop];
		if (
			PROP_PROPS_F in cls &&
			prop in cls[PROP_PROPS_F]
		)
			return cls[PROP_PROPS_F][prop];
		
		cls_id_before = cls_id;
		cls_id =
			(PROP_CLASS_PARENT in cls)
			? cls[PROP_CLASS_PARENT]
			: EC_OBJ;
	}
	while (cls_id !== cls_id_before);
	
	if (prop in prop_owners) {
		const prop_owner = entity_get(prop_owners[prop]);
		if (prop_owner[PROP_OBJ_CLASS] === EC_TRAIT) {
			const trait_value = prop_owner[PROP_PROPS][prop];
			if (
				trait_value !== null ||
				entity_prop_get(
					entity_get(prop),
					PROP_PROP_NULL
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
const prop_to_text = (prop, value) => (
	entity_get(value)
	? entity_prop_get(entity_get(value), PROP_TO_TEXT)(entity_get(value))
	: String(value)
);
const entity_label_get = entity => (
	entity[PROP_LABEL] ||
	'[unbenannt]'
);
entity_class_define(
	EC_OBJ, 'Objekt',
	{
		[PROP_OBJ_ID]: null,
		[PROP_OBJ_CLASS]: null,
		[PROP_OBJ_HARD]: false
	},
	[
		ET_LABEL,
		ET_CT_TEXT
	],
	null,
	{
		[PROP_TO_TEXT]: entity => '#' + entity[PROP_OBJ_ID]
	}
);
entity_class_define(
	EC_CLASS, 'Klasse',
	{
		[PROP_CLASS_PARENT]: EC_OBJ
	},
	[ET_TRAIT]
);
entity_class_define(
	EC_TRAIT, 'Merkmal',
	{
		[PROP_TRAIT_DEPS]: []
	},
	[ET_TRAIT]
);
entity_class_define(
	EC_PROP, 'Eigenschaft',
	{
		[PROP_PROP_CLASS]: EC_OBJ,
		[PROP_PROP_NULL]: false,
		[PROP_PROP_NATIVE]: true
	}
);
entity_class_define(EC_NUM, 'Zahl');
entity_class_define(EC_ENUM, 'Möglichkeit');

entity_define(ET_EDIT, EC_TRAIT, 'Verwaltbar');
entity_define(ET_LABEL, EC_TRAIT, 'Benennbar', {
	[PROP_PROPS]: {
		[PROP_LABEL]: null
	}
});
entity_define(ET_TRAIT, EC_TRAIT, 'Merkmalbar', {
	[PROP_PROPS]: {
		[PROP_PROPS]: {},
		[PROP_PROPS_F]: {},
		[PROP_TRAITS]: []
	}
});
entity_define(ET_CT_TEXT, EC_TRAIT, 'Ausschreibbar', {
	[PROP_PROPS]: {
		[PROP_TO_TEXT]: null
	}
});

entity_prop_define(PROP_OBJ_ID, 'Objekt-ID');
entity_prop_define(PROP_OBJ_CLASS, 'Klasse');
entity_prop_define(PROP_OBJ_HARD, 'Vorgabe?');
entity_prop_define(PROP_LABEL, 'Bezeichnung', true);
entity_prop_define(PROP_PROPS, 'Eigene Zuweisungen');
entity_prop_define(PROP_PROPS_F, 'Überschriebene Zuweisungen');
entity_prop_define(PROP_TRAITS, 'Merkmale');
entity_prop_define(PROP_CLASS_PARENT, 'Elternklasse');
entity_prop_define(PROP_TRAIT_DEPS, 'Abhängigkeiten');
entity_prop_define(PROP_TO_TEXT, 'Umwandeln in Text');
entity_prop_define(PROP_PROP_CLASS, 'Typ');
entity_prop_define(PROP_PROP_NULL, 'Optional?');
entity_prop_define(PROP_PROP_NATIVE, 'Nativ?');
//entity_prop_define(, '');

// TREE NODES //
const NODE_CLASS = 0;
const NODE_PROP = 1;
const NODE_METHOD = 2;
const NODE_SWITCH = 3;
const NODE_LOOP = 4;
const NODE_REF = 5;
const NODE_CALL = 6;

const node_view = {
	view: ({attrs: {columns, branches}}) =>
		m(
			'.node',
			[
				m(
					'.node_head',
					columns
					.map(column =>
						m(
							'div',
							{
								style: 'background:' + column.color_b + ';color:' + column.color_f,
								onclick: column.action
							},
							column.label
						)
					)
				),
				branches !== undefined &&
				branches
				.map(branch =>
					m(
						'.node_branch',
						[
							m(
								'.node_branch_bar',
								{
									style: 'background:' + columns[0].color_b
								}
							),
							m(
								'.node_branch_fork',
								{
									style: 'background:' + columns[0].color_b
								}
							),
							m(
								'.node_branch_dot',
								{
									style: 'border-color:' + columns[0].color_b + ';background:' + branch.color,
									onclick: branch.action
								}
							),
							branch.content
						]
					)
				)
			]
		)
};

const tab_view_entity = {
	view: ({attrs: {entity}}) =>
		m(
			node_view,
			{
				columns: [
					{
						color_b: 'black',
						color_f: 'white',
						action: () => {
							menu_open(
								() => menu_entity(entity)
							);
						},
						label: entity_label_get(entity),
					}
				],
				branches: (
					Object.keys(entity)
					.map(key => Number(key))
					.map(prop => ({
						color: 'white',
						action: null,
						content: (
							m(
								node_view,
								{
									columns: [
										{
											color_b: 'blue',
											color_f: 'white',
											action: () => {
												action_entity_open(
													entity_get(prop)
												);
											},
											label: (
												entity_label_get(entity_get(prop)) +
												': ' +
												prop_to_text(prop, entity[prop])
											)
										}
									]
								}
							)
						)
					}))
				)
			}
		)
};

{
	const entities_stored = localStorage.getItem('entities');
	if (entities_stored) {
		for (const entity of JSON.parse(entities_stored))
			entities.set(entity[PROP_OBJ_ID], entity);
	}
}

onbeforeunload = () => {
	action_save();
};
setInterval(action_save, 6e5);

onerror = error => {
	alert('Fehler: ' + error);
};

m.mount(
	document.body,
	{
		view: () => [
			m(tabs_view),
			m(menu_view)
		]
	}
);