import {TAB} from '../ui/tab.js';

export const CMD_RESET = 0;
export const CMD_REDRAW = 1;
export const CMD_MENU_OPEN = 2;
export const CMD_MENU_BACK = 3;
export const CMD_MENU_CLOSE = 4;
export const CMD_TAB_OPEN = 5;
export const CMD_TAB_OPEN_ENTITY = 6;
export const CMD_TAB_CLOSE = 7;
export const CMD_TAB_CLOSE_ALL = 8;

/**
	@typedef {{
		id: string,
		type: number,
		content: number
	}}
*/
var TYPE_TAB;

/**
	@typedef {{
		menu_stack: !Array<function(TYPE_STATE, function(number, *):void):Array>,
		tab: {
			all: !Array<TYPE_TAB>,
			active: ?number
		},
		rcount: number
	}}
*/
var TYPE_STATE;

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
			active: null
		},
		rcount: 0
	}),

	/**
		REDRAW
		@param {TYPE_STATE} state
		@return {TYPE_STATE}
	*/
	state => ({
		...state,
		rcount: state.rcount + 1
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
			menu_new
		]
	}),

	/**
		MENU BACK
		@param {TYPE_STATE} state
		@return {TYPE_STATE}
	*/
	state => ({
		...state,
		menu_stack: state.menu_stack.slice(0, -1)
	}),

	/**
		MENU CLOSE
		@param {TYPE_STATE} state
		@return {TYPE_STATE}
	*/
	state => ({
		...state,
		menu_stack: []
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
			active: tab
		}
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
								content: entity
							}
						]
				),
				active: id
			}
		};
	},

	/**
		TAB_CLOSE
		@param {TYPE_STATE} state
		@param {tab} string
		@return {TYPE_STATE}
	*/
	(state, tab) => ({
		...state,
		tab: {
			all: state.tab.all.filter(item => item.id !== tab),
			active: (
				state.tab.active !== tab
				?   state.tab.active
				:   null// TODO use next tab
			)
		}
	}),

	/**
		TAB_CLOSE_ALL
		@param {TYPE_STATE} state
		@return {TYPE_STATE}
	*/
	state => ({
		...state,
		tab: {
			all: [],
			active: null
		}
	})
];