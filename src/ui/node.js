import {
	hook_dom,
	node_dom,
	node_map,
} from '../etc/lui.js';

const NodeColumn = ({
	I: {
		action = null,
		color,
		color_b,
		hint = null,
		icon = null,
		label,
	},
}) => (
	hook_dom('div', {
		F: {
			node_head_icon: icon !== null,
		},
		innerText: label,
		onclick: action,
		style: 'background:' + color_b + ';color:' + color,
		title: hint,
	}),
	null
)

const NodeBranch = ({
	color_parent,
	I: {
		action = null,
		color,
		content = null,
	},
}) => (
	hook_dom('div[className=node_branch]'),
	[
		node_dom('div[className=node_branch_bar]', {
			style: 'background:' + color_parent,
		}),
		node_dom('div[className=node_branch_fork]', {
			style: 'background:' + color_parent,
		}),
		action &&
		node_dom('div[className=node_branch_dot]', {
			onclick: action,
			style: 'background:' + color + ';border-color:' + color_parent,
		}),
		content,
	]
)

export const Node = ({
	branches = null,
	columns,
}) => (
	hook_dom('div[className=node]'),
	[
		node_dom('div[className=node_head]', null, [
			node_map(NodeColumn, columns),
		]),
		branches &&
		node_map(NodeBranch, branches, {
			color_parent: columns[0].color_b,
		}),
	]
)
