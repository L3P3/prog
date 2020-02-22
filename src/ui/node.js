/** @type {TYPE_COMPONENT} */
export const node_component = {
	view: ({attrs: {columns, branches}}) => (
		m(
			'.node',
			[
				m(
					'.node_head',
					columns
					.map(column =>
						m(
							'div',
							{
								style: 'background:' + column.color_b + ';color:' + column.color_f,
								onclick: column.action
							},
							column.label
						)
					)
				),
				branches !== undefined &&
				branches
				.map(branch =>
					m(
						'.node_branch',
						[
							m(
								'.node_branch_bar',
								{
									style: 'background:' + columns[0].color_b
								}
							),
							m(
								'.node_branch_fork',
								{
									style: 'background:' + columns[0].color_b
								}
							),
							m(
								'.node_branch_dot',
								{
									style: 'border-color:' + columns[0].color_b + ';background:' + branch.color,
									onclick: branch.action
								}
							),
							branch.content
						]
					)
				)
			]
		)
	)
};