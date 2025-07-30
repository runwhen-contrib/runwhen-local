"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const he_1 = require("he");
const node_1 = __importDefault(require("./node"));
const type_1 = __importDefault(require("./type"));
/**
 * TextNode to contain a text element in DOM tree.
 * @param {string} value [description]
 */
class TextNode extends node_1.default {
    clone() {
        return new TextNode(this._rawText, null);
    }
    constructor(rawText, parentNode = null, range) {
        super(parentNode, range);
        /**
         * Node Type declaration.
         * @type {Number}
         */
        this.nodeType = type_1.default.TEXT_NODE;
        this.rawTagName = '';
        this._rawText = rawText;
    }
    get rawText() {
        return this._rawText;
    }
    /**
     * Set rawText and invalidate trimmed caches
     */
    set rawText(text) {
        this._rawText = text;
        this._trimmedRawText = void 0;
        this._trimmedText = void 0;
    }
    /**
     * Returns raw text with all whitespace trimmed except single leading/trailing non-breaking space
     */
    get trimmedRawText() {
        if (this._trimmedRawText !== undefined)
            return this._trimmedRawText;
        this._trimmedRawText = trimText(this.rawText);
        return this._trimmedRawText;
    }
    /**
     * Returns text with all whitespace trimmed except single leading/trailing non-breaking space
     */
    get trimmedText() {
        if (this._trimmedText !== undefined)
            return this._trimmedText;
        this._trimmedText = trimText(this.text);
        return this._trimmedText;
    }
    /**
     * Get unescaped text value of current node and its children.
     * @return {string} text content
     */
    get text() {
        return (0, he_1.decode)(this.rawText);
    }
    /**
     * Detect if the node contains only white space.
     * @return {boolean}
     */
    get isWhitespace() {
        return /^(\s|&nbsp;)*$/.test(this.rawText);
    }
    toString() {
        return this.rawText;
    }
}
exports.default = TextNode;
/**
 * Trim whitespace except single leading/trailing non-breaking space
 */
function trimText(text) {
    let i = 0;
    let startPos;
    let endPos;
    while (i >= 0 && i < text.length) {
        if (/\S/.test(text[i])) {
            if (startPos === undefined) {
                startPos = i;
                i = text.length;
            }
            else {
                endPos = i;
                i = void 0;
            }
        }
        if (startPos === undefined)
            i++;
        else
            i--;
    }
    if (startPos === undefined)
        startPos = 0;
    if (endPos === undefined)
        endPos = text.length - 1;
    const hasLeadingSpace = startPos > 0 && /[^\S\r\n]/.test(text[startPos - 1]);
    const hasTrailingSpace = endPos < (text.length - 1) && /[^\S\r\n]/.test(text[endPos + 1]);
    return (hasLeadingSpace ? ' ' : '') + text.slice(startPos, endPos + 1) + (hasTrailingSpace ? ' ' : '');
}
