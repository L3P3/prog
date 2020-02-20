#!/bin/env node

const flags = process.argv[2] || '';
const prod = flags.includes('p');
const optimize = prod || flags.includes('o');

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

let code_css = fs.readFileSync('./src/app.css', 'utf8');
let code_js;

if (optimize) {
	console.log('optimizing...');
	const code_css_promise = (
		require('cssnano')
		.process(
			code_css,
			{
				preset: 'advanced'
			}
		)
	);

	await exec(
		'closure-compiler' +
		[
			'assume_function_wrapper',
			'charset UTF-8',
			//'compilation_level ADVANCED',
			'dependency_mode PRUNE',
			'entry_point ./src/app.js',
			'js ./src',
			'js_output_file /tmp/prog-min.js',
			'jscomp_off checkVars',
			'language_in ECMASCRIPT_NEXT',
			'language_out ECMASCRIPT6_STRICT',
			'module_resolution NODE',
			'strict_mode_input',
			'use_types_for_optimization',
			'warning_level DEFAULT'
		]
		.map(opt => ' --' + opt)
		.join('')
	);
	code_js = (
		fs.readFileSync('/tmp/prog-min.js', 'utf8')
		.trim()
		.split('\n').join('')
	);
	fs.unlinkSync('/tmp/prog-min.js');
	if (code_js.endsWith(';')) {
		code_js = code_js.slice(0, -1);
	}

	code_css = await code_css_promise;
}
else {
	code_js = fs.readFileSync('./src/app.js', 'utf8');
}

const code_html =
optimize
? `<!doctype html><html><head><title>Grafische Programmierung</title><meta name=viewport content="width=device-width"><script src=https://unpkg.com/mithril@2.0.4/mithril.min.js></script><style>${code_css}</style></head><body><script>${code_js}</script></body></html>`
: `<!doctype html>
<html>
	<head>
		<title>Grafische Programmierung</title>
		<meta name=viewport content="width=device-width">
		<script src=https://unpkg.com/mithril@2.0.4/mithril.min.js></script>
		<style>
${code_css}
		</style>
	</head>
	<body>
		<script>
${code_js}
		</script>
	</body>
</html>`;

if (fs.readFileSync('./build/app.html', 'utf8') === code_html) {
	console.log('no file changes');
}
else {
	console.log(`total code size: ${
		Math.round(code_html.length / 1024)
	}k`);

	fs.writeFileSync('./build/app.html', code_html, 'utf8');

	console.log('compressing...');

	await exec('zopfli --i1000 ./build/app.html');

	console.log(`compressed size: ${
		Math.round(fs.statSync('./build/app.html.gz').size / 1024)
	}k`);
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