"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = exports.supportedRangeStrategies = exports.supportsRanges = exports.urls = exports.displayName = exports.id = void 0;
const tslib_1 = require("tslib");
const semver = tslib_1.__importStar(require("semver"));
const loose_1 = require("../loose");
const common_1 = require("./common");
const range_1 = require("./range");
exports.id = 'conan';
exports.displayName = 'conan';
exports.urls = [
    'https://semver.org/',
    'https://github.com/podhmo/python-node-semver',
    'https://github.com/podhmo/python-node-semver/tree/master/examples',
    'https://docs.conan.io/en/latest/versioning/version_ranges.html#version-ranges',
];
exports.supportsRanges = true;
exports.supportedRangeStrategies = [
    'auto',
    'bump',
    'widen',
    'replace',
];
const MIN = 1;
const MAX = -1;
function isVersion(input) {
    if (input && !input.includes('[')) {
        const qualifiers = (0, common_1.getOptions)(input);
        const version = (0, common_1.cleanVersion)(input);
        if (qualifiers.loose) {
            if (loose_1.api.isVersion(version)) {
                return true;
            }
        }
        return (0, common_1.makeVersion)(version, qualifiers) !== null;
    }
    return false;
}
function isValid(input) {
    const version = (0, common_1.cleanVersion)(input);
    const qualifiers = (0, common_1.getOptions)(input);
    if ((0, common_1.makeVersion)(version, qualifiers)) {
        return version !== null;
    }
    return semver.validRange(version, qualifiers) !== null;
}
function equals(version, other) {
    const cleanedVersion = (0, common_1.cleanVersion)(version);
    const cleanOther = (0, common_1.cleanVersion)(other);
    const options = { loose: true, includePrerelease: true };
    const looseResult = loose_1.api.equals(cleanedVersion, cleanOther);
    try {
        return semver.eq(cleanedVersion, cleanOther, options) || looseResult;
    }
    catch {
        return looseResult;
    }
}
function isGreaterThan(version, other) {
    const cleanedVersion = (0, common_1.cleanVersion)(version);
    const cleanOther = (0, common_1.cleanVersion)(other);
    const options = { loose: true, includePrerelease: true };
    const looseResult = loose_1.api.isGreaterThan(cleanedVersion, cleanOther);
    try {
        return semver.gt(cleanedVersion, cleanOther, options) || looseResult;
    }
    catch {
        return looseResult;
    }
}
function isLessThanRange(version, range) {
    const cleanedVersion = (0, common_1.cleanVersion)(version);
    const cleanRange = (0, common_1.cleanVersion)(range);
    const options = (0, common_1.getOptions)(range);
    const looseResult = loose_1.api.isLessThanRange?.(cleanedVersion, cleanRange);
    try {
        return semver.ltr(cleanedVersion, cleanRange, options) || looseResult;
    }
    catch {
        return looseResult;
    }
}
function sortVersions(version, other) {
    const cleanedVersion = (0, common_1.cleanVersion)(version);
    const cleanOther = (0, common_1.cleanVersion)(other);
    const options = { loose: true, includePrerelease: true };
    try {
        return semver.compare(cleanedVersion, cleanOther, options);
    }
    catch {
        return loose_1.api.sortVersions(cleanedVersion, cleanOther);
    }
}
function matches(version, range) {
    if (isVersion(version) && isVersion(range)) {
        return true;
    }
    const cleanedVersion = (0, common_1.cleanVersion)(version);
    const options = (0, common_1.getOptions)(range);
    const cleanRange = (0, common_1.cleanVersion)(range);
    return (0, common_1.matchesWithOptions)(cleanedVersion, cleanRange, options);
}
function isCompatible(version, range) {
    if (isVersion(version) && isVersion(range)) {
        return true;
    }
    const options = (0, common_1.getOptions)(range);
    const compatibleVersion = (0, common_1.makeVersion)(version, options);
    if (compatibleVersion) {
        return !isLessThanRange(version, range);
    }
    return false;
}
function isStable(version) {
    const cleanedVersion = (0, common_1.cleanVersion)(version);
    const options = (0, common_1.getOptions)(version);
    if (!options.includePrerelease &&
        semver.prerelease(cleanedVersion, options)) {
        return false;
    }
    return true;
}
function minSatisfyingVersion(versions, range) {
    return (0, common_1.findSatisfyingVersion)(versions, range, MIN);
}
function getSatisfyingVersion(versions, range) {
    return (0, common_1.findSatisfyingVersion)(versions, range, MAX);
}
function getNewValue({ currentValue, rangeStrategy, currentVersion, newVersion, }) {
    const cleanRange = (0, common_1.cleanVersion)(currentValue);
    if (isVersion(currentValue) || rangeStrategy === 'pin') {
        return newVersion;
    }
    const options = (0, common_1.getOptions)(currentValue);
    let newValue = '';
    if (rangeStrategy === 'widen') {
        newValue = (0, range_1.widenRange)({ currentValue: cleanRange, rangeStrategy, currentVersion, newVersion }, options);
    }
    else if (rangeStrategy === 'bump') {
        newValue = (0, range_1.bumpRange)({ currentValue: cleanRange, rangeStrategy, currentVersion, newVersion }, options);
    }
    else {
        newValue = (0, range_1.replaceRange)({
            currentValue: cleanRange,
            rangeStrategy,
            currentVersion,
            newVersion,
        });
    }
    if (newValue) {
        return currentValue.replace(cleanRange, newValue);
    }
    return null;
}
exports.api = {
    equals,
    getMajor: range_1.getMajor,
    getMinor: range_1.getMinor,
    getNewValue,
    getPatch: range_1.getPatch,
    isCompatible,
    isGreaterThan,
    isLessThanRange,
    isSingleVersion: isVersion,
    isStable,
    isValid,
    isVersion,
    matches,
    getSatisfyingVersion,
    minSatisfyingVersion,
    sortVersions,
};
exports.default = exports.api;
//# sourceMappingURL=index.js.map