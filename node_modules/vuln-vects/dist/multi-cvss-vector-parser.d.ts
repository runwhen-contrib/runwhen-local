import { CvssScore } from "./cvss-score";
import { CvssVectorParser } from "./cvss-vector-parser";
/**
 * Implements a service offering CVSS vector parsing.
 *
 * @remarks
 * Consumers should be aware that {@link parse} will raise an exception if an invalid CVSS vector string is passed.
 * This includes strings containing incorrect keys/values and those that are missing required entries.
 *
 * @public
 */
export declare class MultiCvssVectorParser implements CvssVectorParser {
    /**
     * @inheritdoc
     */
    parse(vector: string): CvssScore;
}
