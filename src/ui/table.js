import {
	hook_callback,
	hook_dom,
	hook_memo,
	node_dom,
	node_map,
} from '../etc/lui.js';

import {map_object_index} from '../etc/helpers.js';

const TableHead = ({
	I: {
		label,
		hint,
	},
}) => (
	hook_dom('th', {
		innerText: label,
		title: hint || '',
	}),
	null
)

const TableCell = ({
	record,
	I: column,
}) => {
	const value = record.fields[column.index];
	hook_dom('td', {
		innerText: '' + (
			column.renderer
			?	column.renderer(value, record, column)
			:	value
		),
		onclick: (
			column.action
			?	hook_callback(column.action, [value, record, column])
			:	null
		),
	});
	return null;
}

const TableRow = ({
	columns,
	I: record,
}) => (
	hook_dom('tr'),
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

export const Table = ({
	columns,
	records,
}) => (
	columns = hook_memo(map_object_index, [columns]),
	hook_dom('table[border=1]'),
	[
		node_dom('tr', null, [
			node_map(TableHead, columns),
		]),
		node_map(TableRow, records, {columns}),
	]
)
