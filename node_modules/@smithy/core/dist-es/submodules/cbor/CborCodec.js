import { NormalizedSchema } from "@smithy/core/schema";
import { copyDocumentWithTransform, parseEpochTimestamp } from "@smithy/core/serde";
import { cbor } from "./cbor";
import { dateToTag } from "./parseCborBody";
export class CborCodec {
    createSerializer() {
        const serializer = new CborShapeSerializer();
        serializer.setSerdeContext(this.serdeContext);
        return serializer;
    }
    createDeserializer() {
        const deserializer = new CborShapeDeserializer();
        deserializer.setSerdeContext(this.serdeContext);
        return deserializer;
    }
    setSerdeContext(serdeContext) {
        this.serdeContext = serdeContext;
    }
}
export class CborShapeSerializer {
    setSerdeContext(serdeContext) {
        this.serdeContext = serdeContext;
    }
    write(schema, value) {
        this.value = copyDocumentWithTransform(value, schema, (_, schemaRef) => {
            if (_ instanceof Date) {
                return dateToTag(_);
            }
            if (_ instanceof Uint8Array) {
                return _;
            }
            const ns = NormalizedSchema.of(schemaRef);
            const sparse = !!ns.getMergedTraits().sparse;
            if (ns.isListSchema() && Array.isArray(_)) {
                if (!sparse) {
                    return _.filter((item) => item != null);
                }
            }
            else if (_ && typeof _ === "object") {
                const members = ns.getMemberSchemas();
                const isStruct = ns.isStructSchema();
                if (!sparse || isStruct) {
                    for (const [k, v] of Object.entries(_)) {
                        const filteredOutByNonSparse = !sparse && v == null;
                        const filteredOutByUnrecognizedMember = isStruct && !(k in members);
                        if (filteredOutByNonSparse || filteredOutByUnrecognizedMember) {
                            delete _[k];
                        }
                    }
                    return _;
                }
            }
            return _;
        });
    }
    flush() {
        const buffer = cbor.serialize(this.value);
        this.value = undefined;
        return buffer;
    }
}
export class CborShapeDeserializer {
    setSerdeContext(serdeContext) {
        this.serdeContext = serdeContext;
    }
    read(schema, bytes) {
        const data = cbor.deserialize(bytes);
        return this.readValue(schema, data);
    }
    readValue(_schema, value) {
        const ns = NormalizedSchema.of(_schema);
        const schema = ns.getSchema();
        if (typeof schema === "number") {
            if (ns.isTimestampSchema()) {
                return parseEpochTimestamp(value);
            }
            if (ns.isBlobSchema()) {
                return value;
            }
        }
        if (typeof value === "undefined" ||
            typeof value === "boolean" ||
            typeof value === "number" ||
            typeof value === "string" ||
            typeof value === "bigint" ||
            typeof value === "symbol") {
            return value;
        }
        else if (typeof value === "function" || typeof value === "object") {
            if (value === null) {
                return null;
            }
            if ("byteLength" in value) {
                return value;
            }
            if (value instanceof Date) {
                return value;
            }
            if (ns.isDocumentSchema()) {
                return value;
            }
            if (ns.isListSchema()) {
                const newArray = [];
                const memberSchema = ns.getValueSchema();
                const sparse = ns.isListSchema() && !!ns.getMergedTraits().sparse;
                for (const item of value) {
                    newArray.push(this.readValue(memberSchema, item));
                    if (!sparse && newArray[newArray.length - 1] == null) {
                        newArray.pop();
                    }
                }
                return newArray;
            }
            const newObject = {};
            if (ns.isMapSchema()) {
                const sparse = ns.getMergedTraits().sparse;
                const targetSchema = ns.getValueSchema();
                for (const key of Object.keys(value)) {
                    newObject[key] = this.readValue(targetSchema, value[key]);
                    if (newObject[key] == null && !sparse) {
                        delete newObject[key];
                    }
                }
            }
            else if (ns.isStructSchema()) {
                for (const [key, memberSchema] of ns.structIterator()) {
                    newObject[key] = this.readValue(memberSchema, value[key]);
                }
            }
            return newObject;
        }
        else {
            return value;
        }
    }
}
