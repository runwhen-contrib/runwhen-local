import { MapSchema as IMapSchema, SchemaRef, SchemaTraits } from "@smithy/types";
import { Schema } from "./Schema";
/**
 * A schema with a key schema and value schema.
 * @alpha
 */
export declare class MapSchema extends Schema implements IMapSchema {
    name: string;
    traits: SchemaTraits;
    /**
     * This is expected to be StringSchema, but may have traits.
     */
    keySchema: SchemaRef;
    valueSchema: SchemaRef;
    static symbol: symbol;
    protected symbol: symbol;
    constructor(name: string, traits: SchemaTraits, 
    /**
     * This is expected to be StringSchema, but may have traits.
     */
    keySchema: SchemaRef, valueSchema: SchemaRef);
    static [Symbol.hasInstance](lhs: unknown): lhs is MapSchema;
}
/**
 * Factory for MapSchema.
 * @internal
 */
export declare function map(namespace: string, name: string, traits: SchemaTraits | undefined, keySchema: SchemaRef, valueSchema: SchemaRef): MapSchema;
