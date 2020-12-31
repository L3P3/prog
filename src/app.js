import {
	lui_,
	hook_reducer,
	node
} from './etc/lui.js';

import {
	entities_load,
	entities_save
} from './etc/entity.js';

import {reducer} from './etc/store.js';

import {Menu} from './ui/menu.js';
import {Tabs} from './ui/tab.js';

location.hash !== '#reset' &&
	entities_load();

setInterval(onbeforeunload = entities_save, 6e5);

lui_.init(() => {
	const [store, store_dispatch] = hook_reducer(reducer);

	return [null, [
		node(Tabs, {
			blurred: store.menu_stack.length > 0,
			store_dispatch,
			tab: store.tab
		}),
		node(Menu, {
			store,
			store_dispatch
		})
	]];
});
