"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const he_1 = require("he");
/**
 * Node Class as base class for TextNode and HTMLElement.
 */
class Node {
    constructor(parentNode = null, range) {
        this.parentNode = parentNode;
        this.childNodes = [];
        Object.defineProperty(this, 'range', {
            enumerable: false,
            writable: true,
            configurable: true,
            value: range !== null && range !== void 0 ? range : [-1, -1]
        });
    }
    /**
     * Remove current node
     */
    remove() {
        if (this.parentNode) {
            const children = this.parentNode.childNodes;
            this.parentNode.childNodes = children.filter((child) => {
                return this !== child;
            });
            this.parentNode = null;
        }
        return this;
    }
    get innerText() {
        return this.rawText;
    }
    get textContent() {
        return (0, he_1.decode)(this.rawText);
    }
    set textContent(val) {
        this.rawText = (0, he_1.encode)(val);
    }
}
exports.default = Node;
