"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Rounds the floating point value up to its nearest multiple of 0.1 (i.e. to one decimal place).
 *
 * Behavior specified in: https://www.first.org/cvss/v3.1/specification-document#Appendix-A---Floating-Point-Rounding
 *
 * @param value the value to round
 * @returns the rounded value
 */
function roundUp(value) {
    var rounded = Math.round(value * 100000);
    return rounded % 10000 === 0 ? rounded / 100000.0 : (Math.floor(rounded / 10000) + 1) / 10.0;
}
exports.roundUp = roundUp;
