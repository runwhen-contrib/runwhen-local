"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const graceful_fs_1 = __importDefault(require("graceful-fs"));
exports.default = {
    createReadStream: graceful_fs_1.default.createReadStream,
    readFile: (0, util_1.promisify)(graceful_fs_1.default.readFile),
    writeFile: (0, util_1.promisify)(graceful_fs_1.default.writeFile),
};
//# sourceMappingURL=index.js.map