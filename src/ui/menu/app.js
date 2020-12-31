import {
	entities_reset,
	entities_save
} from '../../etc/entity.js';

import {CMD_REDRAW} from '../../etc/store.js';

let prompt_install = null;

export const menu_app = (
	_,
	store_dispatch
) => ['Erweitert', [
	[
		'Als App installieren',
		prompt_install
		?	() => (
				prompt_install.prompt(),
				prompt_install = null,
				store_dispatch(CMD_REDRAW),
				false
			)
		:	null
	],
	[
		'Alles speichern',
		() => (
			entities_save(),
			true
		)
	],
	[
		'Zurücksetzen',
		() => (
			confirm('Alle Benutzerdaten löschen?') && (
				entities_reset(),
				onbeforeunload = null,
				location.reload()
			),
			false
		)
	],
	[
		'Über dieses Programm',
		() => (
			open('//l3p3.de/dok/graf.html'),
			false
		)
	],
	[
		'Test',
		() => (
			alert('Hallo, Welt!'),
			false
		)
	],
	[
		'©2020, L3P3.de',
		() => (
			open('//l3p3.de'),
			false
		)
	]
]]

window.onbeforeinstallprompt = e => {
	(
		prompt_install = e
	).preventDefault();
}
