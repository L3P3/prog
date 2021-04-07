import {
	hook_callback,
	hook_dom,
	hook_effect,
	hook_reducer,
	hook_state,
	node,
	node_dom,
	node_map,
} from '../etc/lui.js';

import {hook_mouse} from '../etc/helpers.js';

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

const TableHead_handle_down = () => [
	TableHead_handle_move,
	TableHead_handle_up,
	'col-resize',
]
const TableHead_handle_move = (x, y, xi, yi, width, dom) => (
	dom.style.width = Math.max(width + (x - xi) - 5, 5) + 'px'
)
const TableHead_handle_up = (x, y, xi, yi, width, dom, index, columns_dispatch) => (
	columns_dispatch(TABLE_COLUMNS_RESIZE, [
		index,
		Math.max(width + (x - xi), 10),
	])
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
	const [dom, dom_set] = hook_state(null);
	return [
		node_dom('div[className=table_head_cell]', {
			innerText: label,
			R: dom_set,
			S: {
				width: (width - 5) + 'px'
			},
			title: hint || '',
		}),
		node_dom('div[className=table_head_handle]', {
			onmousedown: hook_mouse(
				TableHead_handle_down,
				[
					width,
					dom,
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

	hook_dom('div');
	return [
		node_dom('div[className=table_head]', null, [
			node_map(TableHead, columns, {columns_dispatch}),
		]),
		node_map(TableRow, records, {columns}),
	];
}
