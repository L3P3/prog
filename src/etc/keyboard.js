import {hook_effect} from './lui.js';

const hook_keyboard_keys = {
	// 20: [function(){}]
};

onkeydown = event => {
	let tmp;
	(
		tmp = !(
			(tmp = hook_keyboard_keys[event.keyCode]) &&
			(tmp = tmp[0]) &&
			!tmp(event)
		)
	) ||
		event.preventDefault();
	return tmp;
}

const hook_keyboard_effect = (code, handler) => (
	handler && (
		hook_keyboard_keys[code]
		?	hook_keyboard_keys[code].unshift(handler)
		:	hook_keyboard_keys[code] = [handler],
		hook_keyboard_effect_unmount
	)
)

const hook_keyboard_effect_unmount = (code, handler) => (
	hook_keyboard_keys[code].splice(
		hook_keyboard_keys[code].lastIndexOf(handler),
		1
	)
)

export const hook_keyboard = (
	code,
	handler
) => (
	hook_effect(
		hook_keyboard_effect,
		[code, handler]
	)
)
