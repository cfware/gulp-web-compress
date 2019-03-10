'use strict';

const pipeline = require('stream.pipeline-shim');

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
	types: ['gz', 'br'],
	skipLarger: true,
	gzipOptions: {},
	brotliOptions: {}
};

function gulpWebCompress(options = {}) {
	options = Object.assign({}, defaultOptions, options);
	if (options.types.length === 0) {
		return filter('!**');
	}

	if (options.types.length > new Set(options.types).size) {
		throw new Error('Duplicate compression type provided');
	}

	const fns = options.types.map(type => {
		const fn = handleTypes[type];
		if (!fn) {
			throw new Error(`Unknown compression type: '${type}'`);
		}

		return fn;
	});

	return branch.obj(src => fns.map(fn => fn(src, options)));
}

module.exports = gulpWebCompress;
