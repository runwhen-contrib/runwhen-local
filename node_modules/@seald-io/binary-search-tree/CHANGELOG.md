# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres
to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.3] - 2023-01-19

### Changed

- Correctly log object keys [#1](https://github.com/seald/node-binary-search-tree/pull/1)


## [1.0.2] - 2021-05-19

### Changed

- Specify files to be included in published version, v1.0.1 contained cache,
  which contains, a now revoked, npm authentication token.

## [1.0.1] - 2021-05-19

### Added

- Added a changelog.

### Changed

- Removed `underscore` dependency which was used only in the tests.

## [1.0.0] - 2021-05-17

This version should be a drop-in replacement for `binary-search-tree@0.2.6`
provided you use modern browsers / versions of Node.js since ES6 features are
now used (such as `class` and `const` / `let`).

### Changed

- Update `homepage` & `repository` fields in the `package.json`
- New maintainer [seald](https://github.com/seald/) and new package
  name [@seald-io/binary-search-tree](https://www.npmjs.com/package/@seald-io/binary-search-tree)
  ;
- Added `lockfileVersion: 2` `package-lock.json`;
- Modernized some of the code with ES6 features (`class`, `const` & `let`);
- Uses [`standard`](https://standardjs.com/) to lint the code (which removes all
  unnecessary semicolons);
- Updated dependencies;

### Removed

- Compatibility with old browsers and old version of Node.js that don't support
  ES6 features.

### Security

- This version no longer
  uses [a vulnerable version of `underscore`](https://github.com/advisories/GHSA-cf4h-3jhx-xvhq)
  .

## [0.2.6] - 2016-02-28

See [original repo](https://github.com/louischatriot/node-binary-search-tree)
