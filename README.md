# gulp-web-compress [![NPM Version][npm-image]][npm-url]

A gulp plugin to optionally compress output with gzip and brotli.

## Usage

```js
import {pipeline} from 'stream';
import gulp from 'gulp';
import gulpWebCompress from 'gulp-web-compress';

gulp.task('default', () => pipeline(
	gulp.src('src/**'),
	/* perform build steps */
	gulp.dest('dest', {sourceMaps: '.'}),
	gulpWebCompress(),
	gulp.dest('dest'),
	error => {
		if (error) {
			console.error(error);
		}
	}
));
```

`gulp.dest` must be called before and after `gulpWebCompress`.  The first call to
`gulp.dest` generates source-map files and writes the uncompressed files.  All
files (including source-maps) are then passed to `gulpWebCompress` which produces
`*.gz` and `*.br` files.  Only compressed files reach the second call to `gulp.dest`.


## gulpCompress(options)

### options.types

An array of zero or more strings can be provided.

Default `['br', 'gz]`

Valid types are `br` for brotli compression, `gz` for gzip compression.

### options.skipLarger

This prevents creation of compressed files that are larger than the uncompressed files.

Default `true`

### options.gzipOptions

See node.js [zlib options] documentation.  Example:

```js
gulpCompress({
	types: ['gz'],
	gzipOptions: {
		level: 9
	}
})
```

### options.brotliOptions

See [brotliEncodeParams] documentation.  Example:

```js
gulpCompress({
	types: ['br'],
	brotliOptions: {
		mode: 0,
		quality: 11
	}
})
```

[npm-image]: https://img.shields.io/npm/v/gulp-web-compress.svg
[npm-url]: https://npmjs.org/package/gulp-web-compress
[zlib options]: https://nodejs.org/api/zlib.html#zlib_class_options
[brotliEncodeParams]: https://github.com/MayhemYDG/iltorb#brotliencodeparams
