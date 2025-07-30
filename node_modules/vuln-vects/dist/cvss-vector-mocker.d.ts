import { CvssScoringEngine } from "./cvss-scoring";
/**
 * An abstract mocking service for generating random CVSS vectors.
 *
 * @public
 */
export declare abstract class CvssVectorMocker {
    private _includeTemporal;
    private _includeEnvironmental;
    /**
     * Intializes a new instance of a mocking service for generating random CVSS vectors.
     *
     * @param includeTemporal if true, temporal attributes will be included in geenerated vectors
     * @param includeEnvironmental if true, environmental attributes will be included in generated vectors
     */
    constructor(includeTemporal?: boolean, includeEnvironmental?: boolean);
    /**
     * Gets or sets whether or not this instance will generate temporal attributes.
     */
    get includeTemporal(): boolean;
    set includeTemporal(includeTemporal: boolean);
    /**
     * Gets or sets whether or not this instance will generate environmental attributes.
     */
    get includeEnvironmental(): boolean;
    set includeEnvironmental(includeEnvironmental: boolean);
    /**
     * Chooses and returns a random element of the provided array.
     *
     * @param array the array to take a random element from
     * @returns a random element from the provided array
     */
    protected static takeRandom<T>(array: T[]): T;
    /**
     * Generates a {@link CvssScoringEngine} instance loaded with random values.
     *
     * @returns the {@link CvssScoringEngine} instance
     */
    abstract generate(): CvssScoringEngine;
}
