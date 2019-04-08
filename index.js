'use strict';

const {Transform} = require('stream');

const pipeline = require('stream.pipeline-shim');
const branch = require('branch-pipe');
const brotli = require('gulp-brotli');
const gzip = require('gulp-gzip');

function clone() {
	return new Transform({
		objectMode: true,
		transform(file, enc, cb) {
			cb(null, file.clone());
		}
	});
}

function filter(ext) {
	return new Transform({
		objectMode: true,
		transform(file, enc, cb) {
			const args = [null];
			if (file.extname === ext) {
				args.push(file);
			}

			cb(...args);
		}
	});
}

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
	br: compressFn('.br', ({skipLarger, brotliOptions}) => {
		const options = Object.assign({skipLarger}, brotliOptions, {extension: 'br'});
		return brotli.compress(options);
	}),
	gz: compressFn('.gz', ({skipLarger, gzipOptions}) => {
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
		return filter();
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
