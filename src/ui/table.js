import {
	defer,
	defer_end,
	hook_callback,
	hook_dom,
	hook_effect,
	hook_reducer,
	hook_state,
	node,
	node_dom,
	node_map,
} from '../etc/lui.js';

import {hook_mouse} from '../etc/mouse.js';

const column_settings_default = {
	action: null,
	component: null,
	renderer: null,
	width: 100,
}

const TABLE_COLUMNS_SET = 1;
const TABLE_COLUMNS_RESIZE = 2;

const Table_columns_reducer = [
	// INIT
	() => [],

	// SET
	(state, columns_raw) => (
		columns_raw
		.map((column, index) => ({
			...(
				index < state.length
				?	state[index]
				:	column_settings_default
			),
			...column,
			index,
		}))
	),

	// RESIZE
	(state, [index, width]) => (
		state
		.map(column => (
			column.index !== index
			?	column
			:	{
					...column,
					width,
				}
		))
	),
];

const TableHead_handle_down = (
	x, y,
	xi, yi,
	width, resizing_set
) => (
	resizing_set(width),
	[
		TableHead_handle_move,
		TableHead_handle_up,
		'col-resize',
	]
)
const TableHead_handle_move = (
	x, y,
	xi, yi,
	width, resizing_set
) => (
	resizing_set(
		Math.max(width + x - xi, 15)
	)
)
const TableHead_handle_up = (
	x, y,
	xi, yi,
	width, resizing_set, index, columns_dispatch
) => (
	defer(),
	columns_dispatch(TABLE_COLUMNS_RESIZE, [
		index,
		Math.max(width + x - xi, 15),
	]),
	resizing_set(null),
	defer_end()
)

const TableHead = ({
	columns_dispatch,
	I: {
		label,
		hint,
		index,
		width,
	},
}) => {
	const [resizing, resizing_set] = hook_state(null);
	return [
		node_dom('div[className=table_head_cell]', {
			innerText: label,
			S: {
				width: (
					resizing === null
					?	width
					:	resizing
				) - 5 + 'px'
			},
			title: hint || '',
		}),
		node_dom('div', {
			F: {
				active: resizing !== null,
				table_head_handle: true,
			},
			onmousedown: hook_mouse(
				TableHead_handle_down,
				[
					width,
					resizing_set,
					index,
					columns_dispatch,
				]
			),
		}),
	];
}

const TableCell = ({
	record,
	I: column,
}) => {
	const value = record.fields[column.index];
	hook_dom('div', {
		F: {
			action: column.action !== null,
		},
		innerText: '' + (
			column.component
			?	''
			: column.renderer
			?	column.renderer(value, record, column)
			:	value
		),
		onclick: (
			column.action
			?	hook_callback(column.action, [value, record, column])
			:	null
		),
		S: {
			width: column.width + 'px',
		},
	});
	return (
		column.component
		?	[
				node(column.component, {
					column,
					record,
					value,
				}),
			]
		:	null
	);
}

const TableRow = ({
	columns,
	I: record,
}) => (
	hook_dom('div[className=table_row]'),
	[
		node_map(
			TableCell,
			columns,
			{
				columns,
				record,
			}
		),
	]
)

const Table_columns_effect = (columns_raw, columns_dispatch) => (
	columns_dispatch(TABLE_COLUMNS_SET, columns_raw)
)

export const Table = ({
	columns: columns_raw,
	records,
}) => {
	const [columns, columns_dispatch] = hook_reducer(Table_columns_reducer);
	hook_effect(Table_columns_effect, [columns_raw, columns_dispatch]);

	return [
		node_dom('div[className=table_head]', null, [
			node_map(TableHead, columns, {columns_dispatch}),
		]),
		node_map(TableRow, records, {columns}),
	];
}
