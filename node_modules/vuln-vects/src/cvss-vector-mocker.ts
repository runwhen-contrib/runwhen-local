import { CvssScoringEngine } from "./cvss-scoring";


/**
 * An abstract mocking service for generating random CVSS vectors.
 *
 * @public
 */
export abstract class CvssVectorMocker {

    private _includeTemporal: boolean;

    private _includeEnvironmental: boolean;

    /**
     * Intializes a new instance of a mocking service for generating random CVSS vectors.
     *
     * @param includeTemporal if true, temporal attributes will be included in geenerated vectors
     * @param includeEnvironmental if true, environmental attributes will be included in generated vectors
     */
    public constructor(includeTemporal: boolean = false, includeEnvironmental: boolean = false) {
        this._includeTemporal = includeTemporal;
        this._includeEnvironmental = includeEnvironmental;
    }

    /**
     * Gets or sets whether or not this instance will generate temporal attributes.
     */
    get includeTemporal (): boolean {
        return this._includeTemporal;
    }
    set includeTemporal (includeTemporal: boolean) {
        this._includeTemporal = includeTemporal;
    }

    /**
     * Gets or sets whether or not this instance will generate environmental attributes.
     */
    get includeEnvironmental (): boolean {
        return this._includeEnvironmental;
    }
    set includeEnvironmental (includeEnvironmental: boolean) {
        this._includeEnvironmental = includeEnvironmental;
    }

    /**
     * Chooses and returns a random element of the provided array.
     *
     * @param array the array to take a random element from
     * @returns a random element from the provided array
     */
    protected static takeRandom<T>(array: T[]): T {
        return array[Math.floor(Math.random() * array.length)];
    }

    /**
     * Generates a {@link CvssScoringEngine} instance loaded with random values.
     *
     * @returns the {@link CvssScoringEngine} instance
     */
    public abstract generate(): CvssScoringEngine;
}