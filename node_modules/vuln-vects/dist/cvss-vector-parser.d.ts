import { CvssScore } from "./cvss-score";
/**
 * Represents a service offering CVSS vector parsing.
 *
 * @remarks
 * Implementors must provide CVSS vector parsing at some version compatible with the v2/v3 standards.
 *
 * @public
 */
export interface CvssVectorParser {
    /**
     * Parses a CVSS vector string and converts it to a CVSS score.
     *
     * @param vector the vector string to parse
     */
    parse(vector: string): CvssScore;
}
