"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cvss2_vector_parser_1 = require("./cvss2-vector-parser");
var cvss3_vector_parser_1 = require("./cvss3-vector-parser");
/**
 * Implements a service offering CVSS vector parsing.
 *
 * @remarks
 * Consumers should be aware that {@link parse} will raise an exception if an invalid CVSS vector string is passed.
 * This includes strings containing incorrect keys/values and those that are missing required entries.
 *
 * @public
 */
var MultiCvssVectorParser = /** @class */ (function () {
    function MultiCvssVectorParser() {
    }
    /**
     * @inheritdoc
     */
    MultiCvssVectorParser.prototype.parse = function (vector) {
        // Try CVSS v2 and fall back to v3.
        var parserChain = [
            new cvss2_vector_parser_1.Cvss2VectorParser(),
            new cvss3_vector_parser_1.Cvss3VectorParser()
        ];
        // Maintain the last error thrown.
        var error = null;
        // Move through the parser chain.
        for (var _i = 0, parserChain_1 = parserChain; _i < parserChain_1.length; _i++) {
            var parser = parserChain_1[_i];
            try {
                var score = parser.parse(vector);
                return score; // Parse successful, return score.
            }
            catch (e) {
                error = e; // Parse unsuccessful, remember error.
            }
        }
        // We didn't get a successful parse, so throw the last encountered exception.
        throw error;
    };
    return MultiCvssVectorParser;
}());
exports.MultiCvssVectorParser = MultiCvssVectorParser;
