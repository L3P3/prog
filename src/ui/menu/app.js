import {hook_state} from '../../etc/lui.js';

import {
	entities_reset,
	entities_save,
} from '../../etc/entity.js';
import {CMD_TESTS_TOGGLE} from '../../etc/store.js';

let prompt_install = null;

export const menu_app = store_dispatch => {
	const [installable, installable_set] = hook_state(prompt_install !== null);

	return ['Erweitert', [
		[
			'Als App installieren',
			installable
			?	() => (
					prompt_install.prompt(),
					installable_set(false),
					false
				)
			:	null,
			installable
			?	'Eintrag zu Apps-Liste hinzufügen'
			: prompt_install
			?	'Angeblich bereits installiert'
			:	'Nicht vom Browser angeboten',
		],
		[
			'Alles speichern',
			() => (
				entities_save(),
				true
			),
			'Änderungen lokal speichern, geschieht auch automatisch beim Verlassen der Seite',
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
			'Alle lokalen Änderungen und Erweiterungen verwerfen',
		],
		[
			'Über dieses Programm',
			() => (
				open('//l3p3.de/dok/graf.html'),
				false
			),
			'Dokumentation öffnen',
		],
		[
			'Test',
			() => (
				store_dispatch(CMD_TESTS_TOGGLE),
				false
			),
			'Einfach ausprobieren',
		],
		[
			'©2021, L3P3.de',
			() => (
				open('//l3p3.de'),
				false
			),
			'Die beste Netzseite der Welt öffnen',
		],
	]];
}

window.onbeforeinstallprompt = e => {
	(
		prompt_install = e
	).preventDefault();
}
