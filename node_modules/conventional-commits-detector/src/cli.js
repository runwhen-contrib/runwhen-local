#!/usr/bin/env node

'use strict';

const conventionalCommitsDetector = require(`../`);
const gitRawCommits = require(`git-raw-commits`);
const meow = require(`meow`);
const pkg = require(`../package.json`);
const through = require(`through2-concurrent`);

const cli = meow({
  help:
      `Usage
      $ conventional-commits-detector [<number of samples>]

    Examples
      $ conventional-commits-detector
      $ conventional-commits-detector 10`,
  pkg,
});

const input = cli.input[0];
let sampleCount;
const commits = [];

if (input) {
  sampleCount = parseInt(input, 10);
}

gitRawCommits({
  from: sampleCount ? `HEAD~` + sampleCount : null,
})
  .on(`error`, err => {
    console.error(err.message);
    process.exit(1);
  })
  .pipe(through((data, enc, cb) => {
    commits.push(data.toString());
    cb();
  }, () => {
    const convention = conventionalCommitsDetector(commits);
    console.log(convention);
  }));
