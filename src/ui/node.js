import {
	hook_dom,
	node_dom,
	node_map
} from '../etc/lui.js';

const NodeColumn = ({
	I: column
}) => (
	hook_dom('div', {
		F: {
			node_head_icon: column.icon
		},
		innerText: column.label,
		onclick: column.action,
		style: `background:${column.color_b};color:${column.color_f}`,
		title: column.description || null
	}),
	null
)

const NodeBranch = ({
	I: branch,
	color_b
}) => (
	hook_dom('div[className=node_branch]'),
	[
		node_dom('div[className=node_branch_bar]', {
			style: `background:${color_b}`
		}),
		node_dom('div[className=node_branch_fork]', {
			style: `background:${color_b}`
		}),
		branch.action &&
			node_dom('div[className=node_branch_dot]', {
				onclick: branch.action,
				style: `background:${branch.color};border-color:${color_b}`
			}),
		branch.content
	]
)

export const Node = ({
	branches,
	columns
}) => (
	hook_dom('div[className=node]'),
	[
		node_dom('div[className=node_head]', null, [
			node_map(NodeColumn, columns)
		]),
		branches &&
			node_map(NodeBranch, branches, {
				color_b: columns[0].color_b
			})
	]
)
