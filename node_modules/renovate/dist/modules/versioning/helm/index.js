"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = exports.supportedRangeStrategies = exports.supportsRanges = exports.urls = exports.displayName = exports.id = void 0;
const npm_1 = require("../npm");
exports.id = 'helm';
exports.displayName = 'helm';
exports.urls = [
    'https://semver.org/',
    'https://helm.sh/docs/chart_best_practices/dependencies/#versions',
    'https://github.com/Masterminds/semver#basic-comparisons',
];
exports.supportsRanges = true;
exports.supportedRangeStrategies = [
    'bump',
    'widen',
    'pin',
    'replace',
    'widen',
];
exports.api = {
    ...npm_1.api,
};
//# sourceMappingURL=index.js.map