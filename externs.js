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
	view: function(TYPE_VNODE),
	oninit: function(TYPE_VNODE),
	oncreate: function(TYPE_VNODE),
	onupdate: function(TYPE_VNODE),
	onbeforeremove: function(TYPE_VNODE):Promise,
	onremove: function(TYPE_VNODE),
	onbeforeupdate: function(TYPE_VNODE, TYPE_VNODE): boolean
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