# gulp-web-compress

[![Travis CI][travis-image]][travis-url]
[![Greenkeeper badge][gk-image]](https://greenkeeper.io/)
[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![MIT][license-image]](LICENSE)

A gulp plugin to optionally compress output with gzip and brotli.

### Install gulp-web-compress

This module requires node.js 8 or above.

```sh
npm i -D gulp-web-compress
```

## Usage

```js
'use strict';

const gulp = require('gulp');
const gulpWebCompress = require('gulp-web-compress');

gulp.task('default', () => pipeline(
	gulp.src('src/**'),
	/* perform translations */
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


## gulpCompress(types, options)

### types

An array of zero or more strings can be provided.

Default `['br', 'gz]`

Valid types are `br` for brotli compression, `gz` for gzip compression.

### options.skipLarger

This prevents creation of compressed files that are larger than the uncompressed files.

Default `true`

### options.gzipOptions

See node.js [zlib options] documentation.  Example:

```js
gulpCompress('gz', {
	skipLarger: true,
	gzipOptions: {
		level: 9
	}
})
```

### options.brotliOptions

See [brotliEncodeParams] documentation.  Example:

```js
gulpCompress('gz', {
	skipLarger: true,
	brotliOptions: {
		mode: 0,
		quality: 11
	}
})
```

## Running tests

Tests are provided by xo and ava.

```sh
npm install
npm test
```

[npm-image]: https://img.shields.io/npm/v/gulp-web-compress.svg
[npm-url]: https://npmjs.org/package/gulp-web-compress
[travis-image]: https://travis-ci.org/cfware/gulp-web-compress.svg?branch=master
[travis-url]: https://travis-ci.org/cfware/gulp-web-compress
[gk-image]: https://badges.greenkeeper.io/cfware/gulp-web-compress.svg
[downloads-image]: https://img.shields.io/npm/dm/gulp-web-compress.svg
[downloads-url]: https://npmjs.org/package/gulp-web-compress
[license-image]: https://img.shields.io/npm/l/gulp-web-compress.svg
[zlib options]: https://nodejs.org/api/zlib.html#zlib_class_options
[brotliEncodeParams]: https://github.com/MayhemYDG/iltorb#brotliencodeparams
