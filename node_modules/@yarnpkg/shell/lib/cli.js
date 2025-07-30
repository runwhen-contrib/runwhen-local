#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const clipanion_1 = require("clipanion");
const entry_1 = tslib_1.__importDefault(require("./commands/entry"));
const cli = new clipanion_1.Cli({
    binaryLabel: `Yarn Shell`,
    binaryName: `yarn shell`,
    binaryVersion: require(`@yarnpkg/shell/package.json`).version || `<unknown>`,
});
cli.register(entry_1.default);
cli.register(clipanion_1.Builtins.HelpCommand);
cli.register(clipanion_1.Builtins.VersionCommand);
cli.runExit(process.argv.slice(2), {
    stdin: process.stdin,
    stdout: process.stdout,
    stderr: process.stderr,
});
