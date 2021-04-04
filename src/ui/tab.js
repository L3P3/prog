import {
	hook_dom,
	hook_effect,
	node,
	node_dom,
	node_map,
} from '../etc/lui.js';

import {
	entity_create,
	entity_label_get,
	hook_entity,
} from '../etc/entity.js';

import {Entity} from './entity.js';
import {menu_main} from './menu/main.js';

import {
	CMD_MENU_OPEN,
	CMD_TAB_OPEN,
	CMD_TAB_CLOSE,
} from '../etc/store.js';

/**
	The type of a tab
	@enum {number}
*/
export const TAB = {
	ENTITY: 0,
	METHOD: 1,
}

const TabHead_effect_show = (dom, active) => (
	active &&
		setTimeout(
			() => dom.scrollIntoView(),
			0
		),
	null
)

const TabHead = ({
	I: tab,
	active,
	store_dispatch,
}) => {
	const entity_label = entity_label_get(hook_entity(tab.content));
	active = tab.id === active;
	hook_effect(TabHead_effect_show, [
		hook_dom('div', {
			F: {
				active,
			},
			innerText: entity_label,
			title: entity_label,
			onclick: () => store_dispatch(CMD_TAB_OPEN, tab.id),
		}),
		active,
	]);
	return null;
}

const TabBody = ({
	store_dispatch,
	tab: {
		content,
		type,
	},
}) => (
	hook_dom('div'),
	[
		type === TAB.ENTITY &&
			node(Entity, {
				entity: content,
				store_dispatch,
			}),
	]
)

const TabHeads = ({
	store_dispatch,
	tab: {
		active,
		all,
	},
}) => (
	hook_dom('div[className=tabs]'),
	[
		node_map(TabHead, all, {
			active,
			store_dispatch,
		}),
	]
)

export const Tabs = ({
	blurred,
	store_dispatch,
	tab,
}) => [
	node_dom('div[className=bar]', null, [
		node_dom('div[className=bar_button][innerText=☰][title=Menü öffnen]', {
			onclick: () => store_dispatch(CMD_MENU_OPEN, menu_main),
		}),
		node(TabHeads, {
			store_dispatch,
			tab,
		}),
		node_dom('div[className=bar_button]',
			tab.all.length > 0
			?	{
					innerText: '×',
					onclick: () => store_dispatch(CMD_TAB_CLOSE, tab.active),
					title: 'Seite schließen',
				}
			:	{
					innerText: '+',
					onclick: () => entity_create(store_dispatch),
					title: 'Objekt erstellen',
				}
		),
	]),
	node_dom('div', {
		F: {
			page: true,
			blurred,
		},
	}, [
		tab.active !== null &&
			node(TabBody, {
				store_dispatch,
				tab: tab.all.find(item => item.id === tab.active),
			}),
		tab.active === null &&
			node_dom('div[className=page_empty][innerText=Nichts geöffnet.]'),
	]),
]
