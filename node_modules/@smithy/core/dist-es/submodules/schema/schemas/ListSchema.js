import { TypeRegistry } from "../TypeRegistry";
import { Schema } from "./Schema";
export class ListSchema extends Schema {
    constructor(name, traits, valueSchema) {
        super(name, traits);
        this.name = name;
        this.traits = traits;
        this.valueSchema = valueSchema;
        this.symbol = ListSchema.symbol;
    }
    static [Symbol.hasInstance](lhs) {
        const isPrototype = ListSchema.prototype.isPrototypeOf(lhs);
        if (!isPrototype && typeof lhs === "object" && lhs !== null) {
            const list = lhs;
            return list.symbol === ListSchema.symbol;
        }
        return isPrototype;
    }
}
ListSchema.symbol = Symbol.for("@smithy/core/schema::ListSchema");
export function list(namespace, name, traits = {}, valueSchema) {
    const schema = new ListSchema(namespace + "#" + name, traits, typeof valueSchema === "function" ? valueSchema() : valueSchema);
    TypeRegistry.for(namespace).register(name, schema);
    return schema;
}
