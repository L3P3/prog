import {
	entities_reset,
	entities_save
} from '../../etc/entity.js';

let prompt_install = null;

export const menu_app = () => [
	'Erweitert',
	[
		[
			'Als App installieren',
			prompt_install && (() => {
				prompt_install.prompt()
				.then(() => {
					prompt_install = null;
					m.redraw();
				})
			})
		],
		[
			'Alles speichern',
			() => (entities_save(), true)
		],
		[
			'Zurücksetzen',
			() => {
				if (
					confirm('Alle Benutzerdaten löschen?')
				) {
					entities_reset();
					onbeforeunload = null;
					location.reload();
				}
			}
		],
		[
			'Über dieses Programm',
			() => {
				open('//l3p3.de/dok/graf.html');
			}
		],
		[
			'Test',
			() => {
				alert('Hallo, Welt!');
			}
		],
		[
			'©2020, L3P3.de',
			() => {
				open('//l3p3.de');
			}
		]
	]
];

window.onbeforeinstallprompt = e => {
	(
		prompt_install = e
	).preventDefault();
};