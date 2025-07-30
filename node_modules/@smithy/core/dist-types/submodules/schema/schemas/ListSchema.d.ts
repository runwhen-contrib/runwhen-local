import type { ListSchema as IListSchema, SchemaRef, SchemaTraits } from "@smithy/types";
import { Schema } from "./Schema";
/**
 * A schema with a single member schema.
 * The deprecated Set type may be represented as a list.
 *
 * @alpha
 */
export declare class ListSchema extends Schema implements IListSchema {
    name: string;
    traits: SchemaTraits;
    valueSchema: SchemaRef;
    static symbol: symbol;
    protected symbol: symbol;
    constructor(name: string, traits: SchemaTraits, valueSchema: SchemaRef);
    static [Symbol.hasInstance](lhs: unknown): lhs is ListSchema;
}
/**
 * Factory for ListSchema.
 *
 * @internal
 */
export declare function list(namespace: string, name: string, traits: SchemaTraits | undefined, valueSchema: SchemaRef): ListSchema;
