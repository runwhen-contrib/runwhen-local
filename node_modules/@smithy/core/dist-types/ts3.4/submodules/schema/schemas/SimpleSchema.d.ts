import { SchemaRef, SchemaTraits, TraitsSchema } from "@smithy/types";
import { Schema } from "./Schema";
/**
 * Although numeric values exist for most simple schema, this class is used for cases where traits are
 * attached to those schema, since a single number cannot easily represent both a schema and its traits.
 *
 * @alpha
 */
export declare class SimpleSchema extends Schema implements TraitsSchema {
    name: string;
    schemaRef: SchemaRef;
    traits: SchemaTraits;
    static symbol: symbol;
    protected symbol: symbol;
    constructor(name: string, schemaRef: SchemaRef, traits: SchemaTraits);
    static [Symbol.hasInstance](lhs: unknown): lhs is SimpleSchema;
}
/**
 * Factory for simple schema class objects.
 *
 * @internal
 */
export declare function sim(namespace: string, name: string, schemaRef: SchemaRef, traits: SchemaTraits): SimpleSchema;
