import path from 'path';

import test from 'ava';
import concat from 'concat-stream';
import gulp from 'gulp';
import pipeline from 'stream.pipeline-shim';

import gulpWebCompress from '..';

const fixtures = path.join(__dirname, '..', 'fixtures');

test('exports function', t => {
	t.is(typeof gulpWebCompress, 'function');
});

test('throws on invalid arguments', t => {
	t.throws(() => gulpWebCompress({types: true}), TypeError);
	t.throws(() => gulpWebCompress({types: ['invalid']}), 'Unknown compression type: \'invalid\'');
	t.throws(() => gulpWebCompress({types: ['br', 'br']}), 'Duplicate compression type provided');
});

function runGulp(file, options) {
	return new Promise((resolve, reject) => {
		let data = null;

		pipeline(
			gulp.src(path.join(fixtures, file), {base: fixtures, nodir: true}),
			gulpWebCompress(options),
			concat(objs => {
				data = objs;
			}),
			error => {
				if (error) {
					reject(error);
				} else {
					resolve(data);
				}
			}
		);
	});
}

test('do nothing', async t => {
	const data = await runGulp('index.js', {types: []});

	t.true(Array.isArray(data));
	t.is(data.length, 0);
});

test('gzip skip larger', async t => {
	const data = await runGulp('index.js', {types: ['gz']});

	t.true(Array.isArray(data));
	t.is(data.length, 0);
});

test('brotli skip larger', async t => {
	const data = await runGulp('index.js', {types: ['br']});

	t.true(Array.isArray(data));
	t.is(data.length, 0);
});

test('both skip larger', async t => {
	const data = await runGulp('index.js');

	t.true(Array.isArray(data));
	t.is(data.length, 0);
});

test('gzip allow larger', async t => {
	const data = await runGulp('index.js', {types: ['gz'], skipLarger: false});

	t.true(Array.isArray(data));
	t.is(data.length, 1);
	t.is(data[0].relative, 'index.js.gz');
});

test('brotli allow larger', async t => {
	const data = await runGulp('index.js', {types: ['br'], skipLarger: false});

	t.true(Array.isArray(data));
	t.is(data.length, 1);
	t.is(data[0].relative, 'index.js.br');
});

test('both allow larger', async t => {
	const data = await runGulp('index.js', {skipLarger: false});

	t.true(Array.isArray(data));
	t.deepEqual(data.map(f => f.relative).sort(), ['index.js.br', 'index.js.gz']);
});
