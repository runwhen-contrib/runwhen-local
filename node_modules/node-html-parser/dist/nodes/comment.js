"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = __importDefault(require("./node"));
const type_1 = __importDefault(require("./type"));
class CommentNode extends node_1.default {
    clone() {
        return new CommentNode(this.rawText, null, undefined, this.rawTagName);
    }
    constructor(rawText, parentNode = null, range, rawTagName = '!--') {
        super(parentNode, range);
        this.rawText = rawText;
        this.rawTagName = rawTagName;
        /**
         * Node Type declaration.
         * @type {Number}
         */
        this.nodeType = type_1.default.COMMENT_NODE;
    }
    /**
     * Get unescaped text value of current node and its children.
     * @return {string} text content
     */
    get text() {
        return this.rawText;
    }
    toString() {
        return `<!--${this.rawText}-->`;
    }
}
exports.default = CommentNode;
