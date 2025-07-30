import { CvssScore } from "./cvss-score";
import { CvssVectorParser } from "./cvss-vector-parser";
import { Cvss2VectorParser } from "./cvss2-vector-parser";
import { Cvss3VectorParser } from "./cvss3-vector-parser";


/**
 * Implements a service offering CVSS vector parsing.
 *
 * @remarks
 * Consumers should be aware that {@link parse} will raise an exception if an invalid CVSS vector string is passed.
 * This includes strings containing incorrect keys/values and those that are missing required entries.
 *
 * @public
 */
export class MultiCvssVectorParser implements CvssVectorParser {

    /**
     * @inheritdoc
     */
    public parse (vector: string): CvssScore {

        // Try CVSS v2 and fall back to v3.
        let parserChain : CvssVectorParser[] = [
            new Cvss2VectorParser(),
            new Cvss3VectorParser()
        ];

        // Maintain the last error thrown.
        let error : Error | null = null;

        // Move through the parser chain.
        for (let parser of parserChain) {
            try {
                let score = parser.parse(vector);
                return score; // Parse successful, return score.
            } catch (e) {
                error = e; // Parse unsuccessful, remember error.
            }
        }

        // We didn't get a successful parse, so throw the last encountered exception.
        throw error;
    }
}