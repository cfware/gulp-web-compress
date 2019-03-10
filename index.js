'use strict';

const pipeline = require('stream.pipeline-shim');

const arrify = require('arrify');
const branch = require('branch-pipe');
const brotli = require('gulp-brotli');
const clone = require('gulp-clone');
const filter = require('gulp-filter');
const gzip = require('gulp-gzip');

function compressFn(ext, compressor) {
	return (src, skipLarger) => pipeline(
		src,
		clone(),
		compressor(skipLarger),
		filter(ext),
		() => {}
	);
}

const handleTypes = {
	br: compressFn('**/*.br', skipLarger => brotli.compress({skipLarger})),
	gz: compressFn('**/*.gz', skipGrowingFiles => gzip({skipGrowingFiles}))
};

function gulpWebCompress(types = ['gz', 'br'], opts = {}) {
	types = arrify(types);
	if (types.length === 0) {
		return filter('!**');
	}

	if (types.length > new Set(types).size) {
		throw new Error('Duplicate compression type provided');
	}

	const fns = types.map(type => {
		const fn = handleTypes[type];
		if (!fn) {
			throw new Error(`Unknown compression type: '${type}'`);
		}

		return fn;
	});

	opts = Object.assign({skipLarger: true}, opts);
	return branch.obj(src => fns.map(fn => fn(src, opts.skipLarger)));
}

module.exports = gulpWebCompress;
