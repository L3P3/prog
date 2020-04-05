import {
	entity_create,
	entity_get,
	entity_label_get
} from '../etc/entity.js';

import {entity_component} from './entity.js';
import {menu_open} from './menu.js';
import {menu_main} from './menu/main.js';

/**
	The type of a tab
	@enum {number}
*/
const TAB = {
	ENTITY: 0,
	METHOD: 1
};

export const tabs = [];
let tab_active = null;
let tab_active_last = null;

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
							tab_head,
							{
								tab
							}
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
				tab_content,
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

const tab_head_updated = ({attrs: {tab}, dom}) => {
	if (
		tab === tab_active &&
		tab !== tab_active_last
	) {
		tab_active_last = tab;
		dom.scrollIntoView();
	}
};
/** @type {TYPE_COMPONENT} */
const tab_head = {
	oncreate: tab_head_updated,
	onupdate: tab_head_updated,
	view: ({attrs: {tab}}) => (
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
};

/** @type {TYPE_COMPONENT} */
const tab_content = {
	view: ({attrs: {tab: [type, content]}}) => {
		switch (type) {
			case TAB.ENTITY:
				return m(
					entity_component,
					{
						entity: content
					}
				);
			case TAB.METHOD:
			default:
				return null;
		}
	}
};

// ENTITY //

const tab_entity_get = entity => (
	tabs.find(([type, content]) =>
		type === TAB.ENTITY &&
		content === entity
	)
);
export const tab_entity_create = entity => {
	tabs.push(tab_active = [
		TAB.ENTITY,
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