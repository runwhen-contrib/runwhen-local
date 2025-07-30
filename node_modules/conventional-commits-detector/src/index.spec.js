'use strict';

const {expect} = require(`chai`);
const {describe, it} = require(`mocha`);
const conventionalCommitsDetector = require(`../`);

describe(`conventional-commits-detector`, () => {
  it(`should be angular`, () => {
    const commits = [
      `test(matchers): add support for toHaveClass in tests`,
      `refactor(WebWorker): Unify WebWorker naming\n\nCloses #3205`,
      `feat: upgrade ts2dart to 0.7.1`,
      `feat: export a proper promise type`,
    ];

    expect(conventionalCommitsDetector(commits)).to.equal(`angular`);
  });

  it(`should be atom`, () => {
    const commits = [
      `:memo: Fix license`,
      `:memo: Add a screenshot`,
      `:fire: init`,
      `Prepare 0.0.1 release`,
    ];

    expect(conventionalCommitsDetector(commits)).to.equal(`atom`);
  });

  it(`should be ember`, () => {
    const commits = [
      `[BUGFIX beta] Guard 'meta' and move readonly error to prototype.`,
      `[DOC beta] Add docs for get helper`,
    ];

    expect(conventionalCommitsDetector(commits)).to.equal(`ember`);
  });

  it(`should be eslint`, () => {
    const commits = [
      `Core: Don't expose jQuery.access`,
      `Tests: don't use deprecated argument in test declaration`,
      `Update: Added as-needed option to arrow-parens (fixes #3277)`,
    ];

    expect(conventionalCommitsDetector(commits)).to.equal(`eslint`);
  });

  it(`should be jquery`, () => {
    const commits = [
      `Core: Don't expose jQuery.access`,
      `Tests: don't use deprecated argument in test declaration`,
      `Docs: Fix various spelling mistakes`,
    ];

    expect(conventionalCommitsDetector(commits)).to.equal(`jquery`);
  });

  it(`should be jshint`, () => {
    const commits = [
      `[[FEAT]] Add Window constructor to browser vars`,
      `[[FEAT]] Add pending to Jasmine's globals`,
      `Docs: Fix various spelling mistakes`,
    ];

    expect(conventionalCommitsDetector(commits)).to.equal(`jshint`);
  });
});
