import { SchemaTraits, TraitsSchema } from "@smithy/types";
/**
 * Abstract base for class-based Schema except NormalizedSchema.
 *
 * @alpha
 */
export declare abstract class Schema implements TraitsSchema {
    name: string;
    traits: SchemaTraits;
    protected constructor(name: string, traits: SchemaTraits);
}
