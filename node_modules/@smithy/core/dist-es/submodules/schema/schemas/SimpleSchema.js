import { TypeRegistry } from "../TypeRegistry";
import { Schema } from "./Schema";
export class SimpleSchema extends Schema {
    constructor(name, schemaRef, traits) {
        super(name, traits);
        this.name = name;
        this.schemaRef = schemaRef;
        this.traits = traits;
        this.symbol = SimpleSchema.symbol;
    }
    static [Symbol.hasInstance](lhs) {
        const isPrototype = SimpleSchema.prototype.isPrototypeOf(lhs);
        if (!isPrototype && typeof lhs === "object" && lhs !== null) {
            const sim = lhs;
            return sim.symbol === SimpleSchema.symbol;
        }
        return isPrototype;
    }
}
SimpleSchema.symbol = Symbol.for("@smithy/core/schema::SimpleSchema");
export function sim(namespace, name, schemaRef, traits) {
    const schema = new SimpleSchema(namespace + "#" + name, schemaRef, traits);
    TypeRegistry.for(namespace).register(name, schema);
    return schema;
}
