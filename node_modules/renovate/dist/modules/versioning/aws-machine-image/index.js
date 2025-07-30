"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = exports.supportsRanges = exports.urls = exports.displayName = exports.id = void 0;
const regex_1 = require("../../../util/regex");
const generic_1 = require("../generic");
exports.id = 'aws-machine-image';
exports.displayName = 'aws-machine-image';
exports.urls = [];
exports.supportsRanges = false;
const awsMachineImageRegex = (0, regex_1.regEx)('^ami-(?<suffix>[a-z0-9]{17})$');
class AwsMachineImageVersioningApi extends generic_1.GenericVersioningApi {
    _parse(version) {
        if (version) {
            const matchGroups = awsMachineImageRegex.exec(version)?.groups;
            if (matchGroups) {
                const { suffix } = matchGroups;
                return { release: [1, 0, 0], suffix };
            }
        }
        return null;
    }
    _compare(_version, _other) {
        return 1;
    }
}
exports.api = new AwsMachineImageVersioningApi();
exports.default = exports.api;
//# sourceMappingURL=index.js.map