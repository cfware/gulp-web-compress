'use strict';

const pipeline = require('stream.pipeline-shim');

const arrify = require('arrify');
const branch = require('branch-pipe');
const brotli = require('gulp-brotli');
const clone = require('gulp-clone');
const filter = require('gulp-filter');
const gzip = require('gulp-gzip');

function compressFn(ext, compressor) {
	return (src, options) => pipeline(
		src,
		clone(),
		compressor(options),
		filter(ext),
		() => {}
	);
}

const handleTypes = {
	br: compressFn('**/*.br', ({skipLarger, brotliOptions}) => {
		const options = Object.assign({skipLarger}, brotliOptions, {extension: 'br'});
		return brotli.compress(options);
	}),
	gz: compressFn('**/*.gz', ({skipLarger, gzipOptions}) => {
		return gzip({skipGrowingFiles: skipLarger, gzipOptions});
	})
};

const defaultOptions = {
	skipLarger: true,
	gzipOptions: {},
	brotliOptions: {}
};

function gulpWebCompress(types = ['gz', 'br'], options = {}) {
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

	options = Object.assign({}, defaultOptions, options);
	return branch.obj(src => fns.map(fn => fn(src, options)));
}

module.exports = gulpWebCompress;
