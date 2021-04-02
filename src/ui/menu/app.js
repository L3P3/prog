import {hook_state} from '../../etc/lui.js';

import {
	entities_reset,
	entities_save,
} from '../../etc/entity.js';

let prompt_install = null;

export const menu_app = () => {
	const [installable, installable_set] = hook_state(prompt_install !== null);

	return ['Erweitert', [
		[
			'Als App installieren',
			installable
			?	() => (
					prompt_install.prompt(),
					prompt_install = null,
					installable_set(false),
					false
				)
			:	null,
		],
		[
			'Alles speichern',
			() => (
				entities_save(),
				true
			),
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
			),
		],
		[
			'Über dieses Programm',
			() => (
				open('//l3p3.de/dok/graf.html'),
				false
			),
		],
		[
			'Test',
			() => (
				alert('Hallo, Welt!'),
				false
			),
		],
		[
			'©2021, L3P3.de',
			() => (
				open('//l3p3.de'),
				false
			),
		],
	]];
}

window.onbeforeinstallprompt = e => {
	(
		prompt_install = e
	).preventDefault();
}
