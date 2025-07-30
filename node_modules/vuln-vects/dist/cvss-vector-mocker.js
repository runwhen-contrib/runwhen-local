"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * An abstract mocking service for generating random CVSS vectors.
 *
 * @public
 */
var CvssVectorMocker = /** @class */ (function () {
    /**
     * Intializes a new instance of a mocking service for generating random CVSS vectors.
     *
     * @param includeTemporal if true, temporal attributes will be included in geenerated vectors
     * @param includeEnvironmental if true, environmental attributes will be included in generated vectors
     */
    function CvssVectorMocker(includeTemporal, includeEnvironmental) {
        if (includeTemporal === void 0) { includeTemporal = false; }
        if (includeEnvironmental === void 0) { includeEnvironmental = false; }
        this._includeTemporal = includeTemporal;
        this._includeEnvironmental = includeEnvironmental;
    }
    Object.defineProperty(CvssVectorMocker.prototype, "includeTemporal", {
        /**
         * Gets or sets whether or not this instance will generate temporal attributes.
         */
        get: function () {
            return this._includeTemporal;
        },
        set: function (includeTemporal) {
            this._includeTemporal = includeTemporal;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CvssVectorMocker.prototype, "includeEnvironmental", {
        /**
         * Gets or sets whether or not this instance will generate environmental attributes.
         */
        get: function () {
            return this._includeEnvironmental;
        },
        set: function (includeEnvironmental) {
            this._includeEnvironmental = includeEnvironmental;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Chooses and returns a random element of the provided array.
     *
     * @param array the array to take a random element from
     * @returns a random element from the provided array
     */
    CvssVectorMocker.takeRandom = function (array) {
        return array[Math.floor(Math.random() * array.length)];
    };
    return CvssVectorMocker;
}());
exports.CvssVectorMocker = CvssVectorMocker;
