import {
	entity_create,
	entity_get,
	entity_label_get,
	entity_prop_text_get
} from '../etc/entity.js';

import {menu_open} from './menu.js';
import {menu_entity} from './menu/entity.js';
import {menu_main} from './menu/main.js';
import {node_component} from './node.js';

const TAB_ENTITY = 0;
const TAB_METHOD = 1;

export const tabs = [];
let tab_active = null;

export const tab_close = tab => {
	const index = tabs.indexOf(tab);
	tabs.splice(index, 1);
	if (tab === tab_active)
		tab_active = null;
};

export const tabs_close = () => {
	tabs.length = 0;
	tab_active = null;
};

/** @type {TYPE_COMPONENT} */
export const tabs_component = {
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
								title: entity_label_get(tab[1]),
								onclick: (
									tab !== tab_active
									? () => {
											tab_active = tab;
									}
									: null
								)
							},
							entity_label_get(tab[1])
						)
					)
				),
				m(
					'.bar_button',
					{
						onclick: (
							tabs.length > 0
							? () => {
								tab_close(tab_active);
							}
							: entity_create
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
				tab_component,
				{
					tab: tab_active
				}
			)
			: m(
				'#page_empty',
				'Kein Objekt ausgewählt.'
			)
		)
	]
};

/** @type {TYPE_COMPONENT} */
const tab_component = {
	view: ({attrs: {tab: [type, content]}}) => {
		switch (type) {
			case TAB_ENTITY:
				return m(
					tab_entity_component,
					{
						entity: content
					}
				);
			case TAB_METHOD:
			default:
				return null;
		}
	}
};

// ENTITY //
const tab_entity_get = entity => (
	tabs.find(([type, content]) =>
		type === TAB_ENTITY &&
		content === entity
	)
);
export const tab_entity_create = entity => {
	tabs.push(tab_active = [
		TAB_ENTITY,
		entity
	]);
};
export const tab_entity_open = entity => {
	entity = entity_get(entity);
	(tab_active = tab_entity_get(entity)) ||
	tab_entity_create(entity);
};
export const tab_entity_close = entity => {
	const tab = tab_entity_get(entity);
	tab && tab_close(tab);
};

/** @type {TYPE_COMPONENT} */
const tab_entity_component = {
	view: ({attrs: {entity}}) => (
		m(
			node_component,
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
								node_component,
								{
									columns: [
										{
											color_b: 'blue',
											color_f: 'white',
											action: () => {
												tab_entity_open(prop);
											},
											label: (
												entity_label_get(
													entity_get(prop)
												) +
												': ' +
												entity_prop_text_get(
													entity,
													prop
												)
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
	)
};