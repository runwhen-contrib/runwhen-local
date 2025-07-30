import type { OperationSchema as IOperationSchema, SchemaRef, SchemaTraits } from "@smithy/types";
import { Schema } from "./Schema";
/**
 * This is used as a reference container for the input/output pair of schema, and for trait
 * detection on the operation that may affect client protocol logic.
 *
 * @alpha
 */
export declare class OperationSchema extends Schema implements IOperationSchema {
    name: string;
    traits: SchemaTraits;
    input: SchemaRef;
    output: SchemaRef;
    constructor(name: string, traits: SchemaTraits, input: SchemaRef, output: SchemaRef);
}
/**
 * Factory for OperationSchema.
 * @internal
 */
export declare function op(namespace: string, name: string, traits: SchemaTraits | undefined, input: SchemaRef, output: SchemaRef): OperationSchema;
