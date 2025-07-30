import { CvssScore } from "./cvss-score";
import { Cvss2VectorPrefixOption } from "./cvss2-vector-renderer";
import { Cvss3VectorPrefixOption } from "./cvss3-vector-renderer";
export { enums as cvss2 } from "./cvss2-enums";
export { enums as cvss3 } from "./cvss3-enums";
export { CvssScore } from "./cvss-score";
export { Cvss2ScoringEngine } from "./cvss2-scoring-engine";
export { Cvss2VectorParser } from "./cvss2-vector-parser";
export { Cvss2VectorMocker } from "./cvss2-vector-mocker";
export { Cvss2VectorPrefixOption, Cvss2VectorRenderer } from "./cvss2-vector-renderer";
export { Cvss3ScoringEngine } from "./cvss3-scoring-engine";
export { Cvss3VectorParser } from "./cvss3-vector-parser";
export { Cvss3VectorMocker } from "./cvss3-vector-mocker";
export { Cvss3VectorPrefixOption, Cvss3VectorRenderer } from "./cvss3-vector-renderer";
export { MultiCvssVectorParser } from "./multi-cvss-vector-parser";
/**
 * Parses a CVSS v2 vector and returns the resulting score object.
 *
 * @param vector the vector to parse
 * @returns the resulting score object
 */
export declare function parseCvss2Vector(vector: string): CvssScore;
/**
 * Parses a CVSS v3 vector and returns the resulting score object.
 *
 * @param vector the vector to parse
 * @returns the resulting score object
 */
export declare function parseCvss3Vector(vector: string): CvssScore;
/**
 * Parses a CVSS vector (any version) and returns the resulting score object.
 *
 * @param vector the vector to parse
 * @returns the resulting score object
 */
export declare function parseCvssVector(vector: string): CvssScore;
/**
 * Validates a CVSS v2 vector.
 *
 * @param vector the vector to parse
 * @returns true if validation succeeded, otherwise false
 */
export declare function validateCvss2Vector(vector: string): boolean;
/**
 * Validates a CVSS v3.x vector.
 *
 * @param vector the vector to parse
 * @returns true if validation succeeded, otherwise false
 */
export declare function validateCvss3Vector(vector: string): boolean;
/**
 *  Parses a CVSS vector (any version).
 *
 * @param vector the vector to parse
 * @returns true if validation succeeded, otherwise false
 */
export declare function validateCvssVector(vector: string): boolean;
/**
 * Renders and returns a random CVSS v2 vector as a string.
 *
 * @param includeTemporal whether or not to include a temporal score on the vector
 * @param includeEnvironmental whether or not to include an environmental score on the vector
 * @param prefixOption the desired vector prefixing option
 * @returns the vector as a string
 */
export declare function randomCvss2Vector(includeTemporal?: boolean, includeEnvironmental?: boolean, prefixOption?: Cvss2VectorPrefixOption): string;
/**
 * Renders and returns a random CVSS v3 vector as a string.
 *
 * @param includeTemporal whether or not to include a temporal score on the vector
 * @param includeEnvironmental whether or not to include an environmental score on the vector
 * @param prefixOption the desired vector prefixing option
 * @returns the vector as a string
 */
export declare function randomCvss3Vector(includeTemporal?: boolean, includeEnvironmental?: boolean, prefixOption?: Cvss3VectorPrefixOption): string;
