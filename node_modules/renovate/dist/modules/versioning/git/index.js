"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = exports.supportsRanges = exports.urls = exports.displayName = exports.id = void 0;
const regex_1 = require("../../../util/regex");
const generic_1 = require("../generic");
exports.id = 'git';
exports.displayName = 'git';
exports.urls = ['https://git-scm.com/'];
exports.supportsRanges = false;
const regex = (0, regex_1.regEx)('^[0-9a-f]{7,40}$', 'i');
class GitVersioningApi extends generic_1.GenericVersioningApi {
    _parse(version) {
        if (version?.match(regex)) {
            return { release: [1, 0, 0], suffix: version };
        }
        return null;
    }
    _compare(_version, _other) {
        return -1;
    }
}
exports.api = new GitVersioningApi();
exports.default = exports.api;
//# sourceMappingURL=index.js.map