#!/bin/env node
/* eslint-disable no-undef */

const flags = process.argv[2] || '';
const prod = flags.includes('p');

console.log(`building for ${prod ? 'prod' : 'dev'}...`);

const fs = require('fs');
const child_process_exec = require('child_process')['exec'];

const exec = cmd => (
	new Promise(resolve =>
		child_process_exec(
			cmd,
			resolve
		)
	)
);

(async () => {

console.log('optimizing...');

let code_css = fs.readFileSync('./src/app.css', 'utf8');
const code_css_promise = (
	prod
	? require('cssnano').process(code_css)
	: null
);

console.log(await exec(
	'closure-compiler' +
	[
		'assume_function_wrapper',
		'charset UTF-8',
		'compilation_level ADVANCED',
		'dependency_mode PRUNE',
		'entry_point ./src/app.js',
		'externs ./externs.js',
		'js ./src',
		'js_output_file /tmp/prog-min.js',
		'language_in ECMASCRIPT_NEXT',
		'language_out ECMASCRIPT6_STRICT',
		'module_resolution WEBPACK',
		'strict_mode_input',
		'use_types_for_optimization',
		'warning_level VERBOSE'
	]
	.map(opt => ' --' + opt)
	.join('')
));

let code_js = (
	fs.readFileSync('/tmp/prog-min.js', 'utf8')
	.trim()
	//.split('\n').join('')
);
fs.unlinkSync('/tmp/prog-min.js');
if (code_js.endsWith(';')) {
	code_js = code_js.slice(0, -1);
}

if (code_css_promise !== null)
	code_css = await code_css_promise;

const code_html = `<!doctype html><html><head><title>Grafische Programmierung</title><meta name=viewport content="width=device-width"><script src=https://unpkg.com/mithril@2.0.4/mithril.min.js></script><style>${code_css}</style></head><body><script>${code_js}</script></body></html>`;

if (fs.readFileSync('./build/app.html', 'utf8') === code_html) {
	console.log('no file changes');
}
else {
	console.log(`total code size: ${
		Math.round(code_html.length / 1024)
	}k`);

	fs.writeFileSync('./build/app.html', code_html, 'utf8');

	if (prod) {
		console.log('compressing...');

		await exec('zopfli --i1000 ./build/app.html');

		console.log(`compressed size: ${
			Math.round(fs.statSync('./build/app.html.gz').size / 1024)
		}k`);
	}
	else {
		try {
			fs.unlinkSync('./build/app.html.gz');
		}
		catch (e) {
			//don't care
		}
	}
}

if (
	prod &&
	require('os').hostname() !== 'l3p3-rk5'
) {
	console.log('synchronizing...');
	await exec('rsync -rt ./build/ l3p3.de:/media/Archiv/Entwicklung/js/prog/build/');
}

})()
.catch(console.log);