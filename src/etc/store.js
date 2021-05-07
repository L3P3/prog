import {
	DEBUG,
	assert,
} from './debug.js';

import {TAB} from '../ui/tab.js';

export const CMD_RESET = 0;
export const CMD_MENU_OPEN = 1;
export const CMD_MENU_BACK = 2;
export const CMD_MENU_CLOSE = 3;
export const CMD_TAB_OPEN = 4;
export const CMD_TAB_OPEN_ENTITY = 5;
export const CMD_TAB_CLOSE = 6;
export const CMD_TAB_CLOSE_ALL = 7;
export const CMD_TESTS_TOGGLE = 8;

/**
	@typedef {{
		id: string,
		type: number,
		content: number,
	}} TYPE_TAB

	@typedef {{
		menu_stack: !Array<function(TYPE_STATE, function(number, *):void):Array>,
		tab: {
			all: !Array<TYPE_TAB>,
			active: ?number,
		},
		tests: boolean,
	}} TYPE_STATE
*/

/**
	@type {Array<function(TYPE_STATE, *=):TYPE_STATE>}
*/
export const reducer = [
	/**
		RESET
		@return {TYPE_STATE}
	*/
	() => ({
		menu_stack: [],
		tab: {
			all: [],
			active: null,
		},
		tests: false,
	}),

	/**
		MENU OPEN
		@param {TYPE_STATE} state
		@param {function(TYPE_STATE, function(number, *):void):Array} menu_new
		@return {TYPE_STATE}
	*/
	(state, menu_new) => ({
		...state,
		menu_stack: [
			...state.menu_stack,
			menu_new,
		],
	}),

	/**
		MENU BACK
		@param {TYPE_STATE} state
		@return {TYPE_STATE}
	*/
	state => ({
		...state,
		menu_stack: state.menu_stack.slice(0, -1),
	}),

	/**
		MENU CLOSE
		@param {TYPE_STATE} state
		@return {TYPE_STATE}
	*/
	state => ({
		...state,
		menu_stack: [],
	}),

	/**
		TAB_OPEN
		@param {TYPE_STATE} state
		@param {string} tab
		@return {TYPE_STATE}
	*/
	(state, tab) => ({
		...state,
		tab: {
			all: state.tab.all,
			active: tab,
		},
	}),

	/**
		TAB_OPEN_ENTITY
		@param {TYPE_STATE} state
		@param {number} entity
		@return {TYPE_STATE}
	*/
	(state, entity) => {
		const id = 'e' + entity;
		return {
			...state,
			tab: {
				all: (
					state.tab.all.some(item => item.id === id)
					?	state.tab.all
					:	[
							...state.tab.all,
							{
								id,
								type: TAB.ENTITY,
								content: entity,
							},
						]
				),
				active: id,
			},
		};
	},

	/**
		TAB_CLOSE
		@param {TYPE_STATE} state
		@param {?tab|void} string
		@return {TYPE_STATE}
	*/
	(state, tab) => {
		if (
			!tab &&
			(
				tab = state.tab.active
			) === null
		) {
			return state;
		}

		const index = state.tab.all.findIndex(item => item.id === tab);
		const all = [...state.tab.all];
		all.splice(index, 1);

		DEBUG && assert(index >= 0);

		return {
			...state,
			tab: {
				all,
				active: (
					state.tab.active !== tab
					?	state.tab.active
					: all.length
					?	all[
							Math.min(index, all.length - 1)
						].id
					:	null
				),
			},
		};
	},

	/**
		TAB_CLOSE_ALL
		@param {TYPE_STATE} state
		@return {TYPE_STATE}
	*/
	state => ({
		...state,
		tab: {
			all: [],
			active: null,
		},
	}),

	/**
		TESTS_TOGGLE
		@param {TYPE_STATE} state
		@return {TYPE_STATE}
	*/
	state => ({
		...state,
		tests: !state.tests,
	}),
];