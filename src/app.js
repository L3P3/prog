import {
	entities_load,
	entities_save
} from './etc/entity.js';

import {menu_component} from './ui/menu.js';
import {tabs_component} from './ui/tab.js';

entities_load();

setInterval(onbeforeunload = entities_save, 6e5);

onerror = error => {
	alert('Fehler: ' + JSON.stringify(error));
};

m.mount(
	document.body,
	/** TYPE_COMPONENT */{
		view: () => [
			m(tabs_component),
			m(menu_component)
		]
	}
);