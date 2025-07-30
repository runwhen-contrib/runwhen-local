"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeType = exports.TextNode = exports.Node = exports.valid = exports.CommentNode = exports.HTMLElement = exports.parse = void 0;
const comment_1 = __importDefault(require("./nodes/comment"));
exports.CommentNode = comment_1.default;
const html_1 = __importDefault(require("./nodes/html"));
exports.HTMLElement = html_1.default;
const node_1 = __importDefault(require("./nodes/node"));
exports.Node = node_1.default;
const text_1 = __importDefault(require("./nodes/text"));
exports.TextNode = text_1.default;
const type_1 = __importDefault(require("./nodes/type"));
exports.NodeType = type_1.default;
const parse_1 = __importDefault(require("./parse"));
const valid_1 = __importDefault(require("./valid"));
exports.valid = valid_1.default;
function parse(data, options = {}) {
    return (0, parse_1.default)(data, options);
}
exports.default = parse;
exports.parse = parse;
parse.parse = parse_1.default;
parse.HTMLElement = html_1.default;
parse.CommentNode = comment_1.default;
parse.valid = valid_1.default;
parse.Node = node_1.default;
parse.TextNode = text_1.default;
parse.NodeType = type_1.default;
