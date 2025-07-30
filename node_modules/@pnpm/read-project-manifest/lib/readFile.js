"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readJsonFile = exports.readJson5File = void 0;
const graceful_fs_1 = __importDefault(require("@pnpm/graceful-fs"));
const json5_1 = __importDefault(require("json5"));
const parse_json_1 = __importDefault(require("parse-json"));
const strip_bom_1 = __importDefault(require("strip-bom"));
async function readJson5File(filePath) {
    const text = await readFileWithoutBom(filePath);
    try {
        return {
            data: json5_1.default.parse(text),
            text,
        };
    }
    catch (err) { // eslint-disable-line
        err.message = `${err.message} in ${filePath}`;
        err['code'] = 'ERR_PNPM_JSON5_PARSE';
        throw err;
    }
}
exports.readJson5File = readJson5File;
async function readJsonFile(filePath) {
    const text = await readFileWithoutBom(filePath);
    try {
        return {
            data: (0, parse_json_1.default)(text, filePath),
            text,
        };
    }
    catch (err) { // eslint-disable-line
        err['code'] = 'ERR_PNPM_JSON_PARSE';
        throw err;
    }
}
exports.readJsonFile = readJsonFile;
async function readFileWithoutBom(path) {
    return (0, strip_bom_1.default)(await graceful_fs_1.default.readFile(path, 'utf8'));
}
//# sourceMappingURL=readFile.js.map