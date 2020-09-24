import path from 'path';
import stream from 'stream';
import {promisify} from 'util';
import {fileURLToPath} from 'url';

import t from 'libtap';
import concat from 'concat-stream';
import vinylFS from 'vinyl-fs';

import gulpWebCompress from 'gulp-web-compress';

const pipeline = promisify(stream.pipeline);
const fixtures = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');

t.type(gulpWebCompress, 'function');

function test(name, file, options, expected) {
	t.test(name, async t => {
		let data = null;

		await pipeline(
			vinylFS.src(path.join(fixtures, file), {base: fixtures, nodir: true}),
			gulpWebCompress(options),
			concat(objs => {
				data = objs;
			})
		);

		t.same(data.map(f => f.relative).sort(), expected, 'expected files');
	});
}

t.test('throws on invalid arguments', async t => {
	t.throws(() => gulpWebCompress({types: true}), TypeError);
	t.throws(() => gulpWebCompress({types: ['invalid']}), 'Unknown compression type: \'invalid\'');
	t.throws(() => gulpWebCompress({types: ['br', 'br']}), 'Duplicate compression type provided');
});

test('do nothing', 'index.js', {types: []}, []);
test('gzip skip larger', 'index.js', {types: ['gz']}, []);
test('brotli skip larger', 'index.js', {types: ['br']}, []);
test('both skip larger', 'index.js', undefined, []);
test('gzip allow larger', 'index.js', {types: ['gz'], skipLarger: false}, ['index.js.gz']);
test('brotli allow larger', 'index.js', {types: ['br'], skipLarger: false}, ['index.js.br']);
test('both allow larger', 'index.js', {skipLarger: false}, ['index.js.br', 'index.js.gz']);
