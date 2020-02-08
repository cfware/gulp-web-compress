import {pipeline, Transform} from 'stream';

import branch from 'branch-pipe';
import brotli from 'gulp-brotli';
import gzip from 'gulp-gzip';

function clone() {
	return new Transform({
		objectMode: true,
		transform(file, encoding, callback) {
			callback(null, file.clone());
		}
	});
}

function filter(extension) {
	return new Transform({
		objectMode: true,
		transform(file, encoding, callback) {
			const args = [null];
			if (file.extname === extension) {
				args.push(file);
			}

			callback(...args);
		}
	});
}

function compressFn(extension, compressor) {
	return (source, options) => pipeline(
		source,
		clone(),
		compressor(options),
		filter(extension),
		() => {}
	);
}

const handleTypes = {
	br: compressFn('.br', ({skipLarger, brotliOptions}) => {
		return brotli.compress({
			skipLarger,
			...brotliOptions,
			extension: 'br'
		});
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

export default function gulpWebCompress(options = {}) {
	options = {
		...defaultOptions,
		...options
	};
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

	return branch.obj(source => fns.map(fn => fn(source, options)));
}
