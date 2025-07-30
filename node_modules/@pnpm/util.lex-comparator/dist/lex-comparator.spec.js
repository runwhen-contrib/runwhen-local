"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lex_comparator_1 = require("./lex-comparator");
it('should return the correct value', () => {
    expect((0, lex_comparator_1.lexCompare)('a', 'b')).toBe(-1);
    expect((0, lex_comparator_1.lexCompare)('a', 'a')).toBe(0);
    expect((0, lex_comparator_1.lexCompare)('b', 'a')).toBe(1);
});
//# sourceMappingURL=lex-comparator.spec.js.map