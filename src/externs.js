/** @externs */
/* eslint-disable no-unused-vars */

/**
	@typedef {(!Array<string>|!Array<number>|!Array<{id: string}>|!Array<{id: number}>)}
*/
var TYPE_NODEDATA;

/**
	@typedef {(string|number|{id: (string|number)})}
*/
var TYPE_NODEDATA_ITEM;

/**
	@typedef {!Object<string, boolean>}
	@dict
*/
var TYPE_PROPS_F;

/**
	@typedef {!Object<string, string>}
	@dict
*/
var TYPE_PROPS_S;

/**
	@typedef {{
		C: (void|TYPE_NODELIST),
		F: (void|TYPE_PROPS_F),
		R: (void|function(HTMLElement):void),
		S: (void|TYPE_PROPS_S),
		I: (void|TYPE_NODEDATA)
	}}
	@dict
*/
var TYPE_PROPS;

/**
	@typedef {function(TYPE_PROPS):?TYPE_NODELIST}
*/
var TYPE_COMPONENT;

/**
	@typedef {!Object}
*/
var TYPE_NODE;

/**
	@typedef {!Array<(?TYPE_NODE|boolean)>}
*/
var TYPE_NODELIST;

var lui = {}

/**
	@param {boolean=} condition
	@return {void}
*/
lui.hook_assert = function(condition){}

/**
	@template T
	@param {function(...*):Promise<T>} getter
	@param {?Array=} deps
	@param {T=} fallback
	@return {T}
*/
lui.hook_async = function(getter, deps, fallback){}

/**
	@param {Function} callback
	@param {?Array=} deps
	@return {Function}
*/
lui.hook_callback = function(callback, deps){}

/**
	@param {number} msecs
	@return {boolean}
*/
lui.hook_delay = function(msecs){}

/**
	@param {string} descriptor
	@param {?TYPE_PROPS=} attributes
	@return {HTMLElement}
*/
lui.hook_dom = function(descriptor, attributes){}

/**
	@param {function(?):(void|function(?):void)} effect
	@param {?Array=} deps
	@return {void}
*/
lui.hook_effect = function(effect, deps){}

/**
	@return {boolean}
*/
lui.hook_first = function(){}

/**
	@template T
	@param {function(?):T} getter
	@param {?Array=} deps
	@return {T}
*/
lui.hook_memo = function(getter, deps){}

/**
	@param {!Object<string, *>} object
	@return {!Array<string>}
*/
lui.hook_object_changes = function(object){}

/**
	@template T
	@param {T} value
	@param {T=} initial
	@return {T}
*/
lui.hook_prev = function(value, initial){}

/**
	@param {!Array<Function>} reducer
	@return {!Array}
*/
lui.hook_reducer = function(reducer){}

/**
	@param {Function} reducer
	@param {?Function=} init
	@return {!Array}
*/
lui.hook_reducer_f = function(reducer, init){}

/**
	@return {void}
*/
lui.hook_rerender = function(){}

/**
	@param {*} initial
	@return {!Array}
*/
lui.hook_state = function(){}

/**
	@template T
	@param {T} initial
	@return {T}
*/
lui.hook_static = function(initial){}

/**
	@template T
	@param {function(?):T} getter
	@param {?Array=} deps
	@return {T}
*/
lui.hook_sub = function(getter, deps){}

/**
	@param {number} target
	@param {number} msecs
	@param {number}
*/
lui.hook_transition = function(target, msecs){}

/**
	@param {function():[?TYPE_PROPS, ?TYPE_NODELIST]} root
	@return {void}
*/
lui.init = function(root){}

/**
	@param {TYPE_COMPONENT} component
	@param {?TYPE_PROPS=} props
	@param {TYPE_NODELIST=} childs
	@return {TYPE_NODE}
*/
lui.node = function(component, props, childs){}

/**
	@param {string} descriptor
	@param {?TYPE_PROPS=} attributes
	@param {TYPE_NODELIST=} childs
	@return {TYPE_NODE}
*/
lui.node_dom = function(descriptor, attributes, childs){}

/**
	@param {TYPE_COMPONENT} component
	@param {TYPE_NODEDATA} data
	@param {?TYPE_PROPS=} props
	@return {TYPE_NODE}
*/
lui.node_map = function(component, data, props){}

/**
	@return {number}
*/
lui.now = function(){}

/**
	@typedef {Object<number, Array>}
	@dict
*/
var TYPE_ENTITY

var localStorage = {
	getItem: function(){},
	setItem: function(){},
	removeItem: function(){}
}

/**
	@param {string} url
	@return {void}
*/
function open(url){}

function onbeforeinstallprompt(){}
function onbeforeunload(){}
function onerror(){}