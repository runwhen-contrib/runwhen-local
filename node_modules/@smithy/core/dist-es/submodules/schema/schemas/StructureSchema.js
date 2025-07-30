import { TypeRegistry } from "../TypeRegistry";
import { Schema } from "./Schema";
export class StructureSchema extends Schema {
    constructor(name, traits, memberNames, memberList) {
        super(name, traits);
        this.name = name;
        this.traits = traits;
        this.memberNames = memberNames;
        this.memberList = memberList;
        this.symbol = StructureSchema.symbol;
        this.members = {};
        for (let i = 0; i < memberNames.length; ++i) {
            this.members[memberNames[i]] = Array.isArray(memberList[i])
                ? memberList[i]
                : [memberList[i], 0];
        }
    }
    static [Symbol.hasInstance](lhs) {
        const isPrototype = StructureSchema.prototype.isPrototypeOf(lhs);
        if (!isPrototype && typeof lhs === "object" && lhs !== null) {
            const struct = lhs;
            return struct.symbol === StructureSchema.symbol;
        }
        return isPrototype;
    }
}
StructureSchema.symbol = Symbol.for("@smithy/core/schema::StructureSchema");
export function struct(namespace, name, traits, memberNames, memberList) {
    const schema = new StructureSchema(namespace + "#" + name, traits, memberNames, memberList);
    TypeRegistry.for(namespace).register(name, schema);
    return schema;
}
