import { TypeRegistry } from "../TypeRegistry";
import { StructureSchema } from "./StructureSchema";
export class ErrorSchema extends StructureSchema {
    constructor(name, traits, memberNames, memberList, ctor) {
        super(name, traits, memberNames, memberList);
        this.name = name;
        this.traits = traits;
        this.memberNames = memberNames;
        this.memberList = memberList;
        this.ctor = ctor;
        this.symbol = ErrorSchema.symbol;
    }
    static [Symbol.hasInstance](lhs) {
        const isPrototype = ErrorSchema.prototype.isPrototypeOf(lhs);
        if (!isPrototype && typeof lhs === "object" && lhs !== null) {
            const err = lhs;
            return err.symbol === ErrorSchema.symbol;
        }
        return isPrototype;
    }
}
ErrorSchema.symbol = Symbol.for("@smithy/core/schema::ErrorSchema");
export function error(namespace, name, traits = {}, memberNames, memberList, ctor) {
    const schema = new ErrorSchema(namespace + "#" + name, traits, memberNames, memberList, ctor);
    TypeRegistry.for(namespace).register(name, schema);
    return schema;
}
