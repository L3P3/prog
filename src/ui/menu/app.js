import {
	entities_reset,
	entities_save
} from '../../etc/entity.js';

export const menu_app = () => [
	'Erweitert',
	[
		[
			'Test',
			() => {
				alert('Hallo, Welt!');
			}
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
					location.reload();
				}
			}
		],
		['Grafische Programmierung, ©2020'],
		['95% in DroidEdit, Android 4.4'],
		['5% in Notepad++, Windows XP'],
		[
			'L3P3.de',
			() => {
				open('//l3p3.de');
			}
		]
	]
];