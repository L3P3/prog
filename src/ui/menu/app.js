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
		['50% in DroidEdit'],
		['2% in Notepad++'],
		['48% in VS Code'],
		[
			'©2020, L3P3.de',
			() => {
				open('//l3p3.de');
			}
		]
	]
];