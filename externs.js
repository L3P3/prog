/* eslint-disable no-unused-vars */
/**
@typedef {{
	tag: (string|Object),
	attrs: Object,
	children: Array,
	dom: Element,
	state: Object
}}
*/
var TYPE_VNODE;

/**
@typedef {{
	view: function(TYPE_VNODE)
}}
*/
var TYPE_COMPONENT;

/**
@typedef {Object<number, Array>}
@dict
*/
var TYPE_ENTITY;

/** @nosideeffects */
function m(){}
m.mount = function(){}

var localStorage = {
	getItem: function(){},
	setItem: function(){},
	removeItem: function(){}
};
function open(){}

function onbeforeunload(){}
function onerror(){}