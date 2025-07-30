"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class VoidTag {
    constructor(addClosingSlash = false, tags) {
        this.addClosingSlash = addClosingSlash;
        if (Array.isArray(tags)) {
            this.voidTags = tags.reduce((set, tag) => {
                return set.add(tag.toLowerCase()).add(tag.toUpperCase()).add(tag);
            }, new Set());
        }
        else {
            this.voidTags = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'].reduce((set, tag) => {
                return set.add(tag.toLowerCase()).add(tag.toUpperCase()).add(tag);
            }, new Set());
        }
    }
    formatNode(tag, attrs, innerHTML) {
        const addClosingSlash = this.addClosingSlash;
        const closingSpace = (addClosingSlash && attrs && !attrs.endsWith(' ')) ? ' ' : '';
        const closingSlash = addClosingSlash ? `${closingSpace}/` : '';
        return this.isVoidElement(tag.toLowerCase()) ? `<${tag}${attrs}${closingSlash}>` : `<${tag}${attrs}>${innerHTML}</${tag}>`;
    }
    isVoidElement(tag) {
        return this.voidTags.has(tag);
    }
}
exports.default = VoidTag;
