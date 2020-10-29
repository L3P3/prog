export const menu_stack = [];
			
export const menu_open = menu => {
	menu_stack.push(menu);
};
const menu_back = () => {
	menu_stack.pop();
};
const menu_close = () => {
	menu_stack.length = 0;
};

/** @type {TYPE_COMPONENT} */
export const menu_component = {
	view: () => {
		if (menu_stack.length === 0) {
			return null;
		}
		const [title, entries, extra] = menu_stack[menu_stack.length - 1]();
		return (
			m(
				'#menu',
				[
					m(
						'.bar',
						[
							m(
								'.bar_button',
								{
									onclick: menu_back,
									title: 'Zurück'
								},
								'◀'
							),
							m(
								'#menu_title',
								title
							),
							extra &&
							m(
								'.bar_button',
								{
									onclick: (
										extra[1]
										? () => {
											extra[1]() &&
											menu_close();
										}
										: null
									),
									title: extra[2] || null
								},
								extra[0]
							)
						]
					),
					m(
						'#menu_entries',
						(
							entries
							.map((entry, index) =>
								entry &&
								m(
									'',
									{
										key: index,
										className: (
											entry[1]
											? 'action'
											: ''
										),
										onclick: (
											entry[1]
											? () => {
												entry[1]() &&
												menu_close();
											}
											: null
										)
									},
									entry[0]
								)
							)
							.filter(Boolean)
						)
					)
				]
			)
		);
	}
};