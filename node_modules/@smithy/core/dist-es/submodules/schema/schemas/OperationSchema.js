import { TypeRegistry } from "../TypeRegistry";
import { Schema } from "./Schema";
export class OperationSchema extends Schema {
    constructor(name, traits, input, output) {
        super(name, traits);
        this.name = name;
        this.traits = traits;
        this.input = input;
        this.output = output;
    }
}
export function op(namespace, name, traits = {}, input, output) {
    const schema = new OperationSchema(namespace + "#" + name, traits, input, output);
    TypeRegistry.for(namespace).register(name, schema);
    return schema;
}
