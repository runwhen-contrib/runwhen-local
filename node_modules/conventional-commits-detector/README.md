# conventional-commits-detector

> :mag: Detect what commit message convention your repository is using.

## Table of Contents
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Debugging](#debugging)
- [Node Support Policy](#node-support-policy)
- [Contributing](#contributing)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Features

Detects the following commit conventions:

* [x] angular
* [x] atom
* [x] ember
* [x] eslint
* [x] jquery
* [x] jshint

## Installation

To install the `conventional-commits-detector` tool please run the following command:

```bash
yarn [global] add [--dev] conventional-commits-detector
```

## Usage

There are two ways to use `conventional-commits-detector`, either as a CLI tool, or programmatically.

**Programmatically**

```javascript
const conventionalCommitsDetector = require(`conventional-commits-detector`);

conventionalCommitsDetector([
  `test(matchers): add support for toHaveClass in tests`,
  `refactor(WebWorker): Unify WebWorker naming\n\nCloses #3205`,
  `feat: upgrade ts2dart to 0.7.1`,
  `feat: export a proper promise type`,
]);

// angular
```

**CLI Tool**

After you've installed `conventional-commits-detector`, you can call the tool based on whether you installed it globally or locally:

_Globally_
```bash
conventional-commits-detector
```

_Locally_
```bash
$(yarn bin)/conventional-commits-detector
```

```bash
$ conventional-commits-detector

angular
```

You can also specify how many commit messages to fetch for the git repository in the current working directory:

```bash
$ conventional-commits-detector 10

angular
```

## Debugging

To assist users of `conventional-commits-detector` with debugging the behavior of this module we use the [debug](https://www.npmjs.com/package/debug) utility package to print information about the publish process to the console. To enable debug message printing, the environment variable `DEBUG`, which is the variable used by the `debug` package, must be set to a value configured by the package containing the debug messages to be printed.

To print debug messages on a unix system set the environment variable `DEBUG` with the name of this package prior to executing `conventional-commits-detector`:

```bash
DEBUG=conventional-commits-detector conventional-commits-detector
```

On the Windows command line you may do:

```bash
set DEBUG=conventional-commits-detector
conventional-commits-detector
```

## Node Support Policy

We only support [Long-Term Support](https://github.com/nodejs/LTS) versions of Node.

We specifically limit our support to LTS versions of Node, not because this package won't work on other versions, but because we have a limited amount of time, and supporting LTS offers the greatest return on that investment.

It's possible this package will work correctly on newer versions of Node. It may even be possible to use this package on older versions of Node, though that's more unlikely as we'll make every effort to take advantage of features available in the oldest LTS version we support.

As each Node LTS version reaches its end-of-life we will remove that version from the `node` `engines` property of our package's `package.json` file. Removing a Node version is considered a breaking change and will entail the publishing of a new major version of this package. We will not accept any requests to support an end-of-life version of Node. Any merge requests or issues supporting an end-of-life version of Node will be closed.

We will accept code that allows this package to run on newer, non-LTS, versions of Node. Furthermore, we will attempt to ensure our own changes work on the latest version of Node. To help in that commitment, our continuous integration setup runs against all LTS versions of Node in addition the most recent Node release; called _current_.

JavaScript package managers should allow you to install this package with any version of Node, with, at most, a warning if your version of Node does not fall within the range specified by our `node` `engines` property. If you encounter issues installing this package, please report the issue to your package manager.

## Contributing

Please read our [contributing](https://github.com/conventional-changelog/conventional-commits-detector/blob/master/CONTRIBUTING.md) guide on how you can help improve this project.
