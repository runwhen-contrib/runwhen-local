import { deref } from "../deref";
import { ListSchema } from "./ListSchema";
import { MapSchema } from "./MapSchema";
import { SCHEMA } from "./sentinels";
import { SimpleSchema } from "./SimpleSchema";
import { StructureSchema } from "./StructureSchema";
export class NormalizedSchema {
    constructor(ref, memberName) {
        this.ref = ref;
        this.memberName = memberName;
        this.symbol = NormalizedSchema.symbol;
        const traitStack = [];
        let _ref = ref;
        let schema = ref;
        this._isMemberSchema = false;
        while (Array.isArray(_ref)) {
            traitStack.push(_ref[1]);
            _ref = _ref[0];
            schema = deref(_ref);
            this._isMemberSchema = true;
        }
        if (traitStack.length > 0) {
            this.memberTraits = {};
            for (let i = traitStack.length - 1; i >= 0; --i) {
                const traitSet = traitStack[i];
                Object.assign(this.memberTraits, NormalizedSchema.translateTraits(traitSet));
            }
        }
        else {
            this.memberTraits = 0;
        }
        if (schema instanceof NormalizedSchema) {
            this.name = schema.name;
            this.traits = schema.traits;
            this._isMemberSchema = schema._isMemberSchema;
            this.schema = schema.schema;
            this.memberTraits = Object.assign({}, schema.getMemberTraits(), this.getMemberTraits());
            this.normalizedTraits = void 0;
            this.ref = schema.ref;
            this.memberName = memberName ?? schema.memberName;
            return;
        }
        this.schema = deref(schema);
        if (this.schema && typeof this.schema === "object") {
            this.traits = this.schema?.traits ?? {};
        }
        else {
            this.traits = 0;
        }
        this.name =
            (typeof this.schema === "object" ? this.schema?.name : void 0) ?? this.memberName ?? this.getSchemaName();
        if (this._isMemberSchema && !memberName) {
            throw new Error(`@smithy/core/schema - NormalizedSchema member schema ${this.getName(true)} must initialize with memberName argument.`);
        }
    }
    static [Symbol.hasInstance](lhs) {
        const isPrototype = NormalizedSchema.prototype.isPrototypeOf(lhs);
        if (!isPrototype && typeof lhs === "object" && lhs !== null) {
            const ns = lhs;
            return ns.symbol === NormalizedSchema.symbol;
        }
        return isPrototype;
    }
    static of(ref, memberName) {
        if (ref instanceof NormalizedSchema) {
            return ref;
        }
        return new NormalizedSchema(ref, memberName);
    }
    static translateTraits(indicator) {
        if (typeof indicator === "object") {
            return indicator;
        }
        indicator = indicator | 0;
        const traits = {};
        if ((indicator & 1) === 1) {
            traits.httpLabel = 1;
        }
        if (((indicator >> 1) & 1) === 1) {
            traits.idempotent = 1;
        }
        if (((indicator >> 2) & 1) === 1) {
            traits.idempotencyToken = 1;
        }
        if (((indicator >> 3) & 1) === 1) {
            traits.sensitive = 1;
        }
        if (((indicator >> 4) & 1) === 1) {
            traits.httpPayload = 1;
        }
        if (((indicator >> 5) & 1) === 1) {
            traits.httpResponseCode = 1;
        }
        if (((indicator >> 6) & 1) === 1) {
            traits.httpQueryParams = 1;
        }
        return traits;
    }
    static memberFrom(memberSchema, memberName) {
        if (memberSchema instanceof NormalizedSchema) {
            memberSchema.memberName = memberName;
            memberSchema._isMemberSchema = true;
            return memberSchema;
        }
        return new NormalizedSchema(memberSchema, memberName);
    }
    getSchema() {
        if (this.schema instanceof NormalizedSchema) {
            return (this.schema = this.schema.getSchema());
        }
        if (this.schema instanceof SimpleSchema) {
            return deref(this.schema.schemaRef);
        }
        return deref(this.schema);
    }
    getName(withNamespace = false) {
        if (!withNamespace) {
            if (this.name && this.name.includes("#")) {
                return this.name.split("#")[1];
            }
        }
        return this.name || undefined;
    }
    getMemberName() {
        if (!this.isMemberSchema()) {
            throw new Error(`@smithy/core/schema - cannot get member name on non-member schema: ${this.getName(true)}`);
        }
        return this.memberName;
    }
    isMemberSchema() {
        return this._isMemberSchema;
    }
    isUnitSchema() {
        return this.getSchema() === "unit";
    }
    isListSchema() {
        const inner = this.getSchema();
        if (typeof inner === "number") {
            return inner >= SCHEMA.LIST_MODIFIER && inner < SCHEMA.MAP_MODIFIER;
        }
        return inner instanceof ListSchema;
    }
    isMapSchema() {
        const inner = this.getSchema();
        if (typeof inner === "number") {
            return inner >= SCHEMA.MAP_MODIFIER && inner <= 255;
        }
        return inner instanceof MapSchema;
    }
    isDocumentSchema() {
        return this.getSchema() === SCHEMA.DOCUMENT;
    }
    isStructSchema() {
        const inner = this.getSchema();
        return (inner !== null && typeof inner === "object" && "members" in inner) || inner instanceof StructureSchema;
    }
    isBlobSchema() {
        return this.getSchema() === SCHEMA.BLOB || this.getSchema() === SCHEMA.STREAMING_BLOB;
    }
    isTimestampSchema() {
        const schema = this.getSchema();
        return typeof schema === "number" && schema >= SCHEMA.TIMESTAMP_DEFAULT && schema <= SCHEMA.TIMESTAMP_EPOCH_SECONDS;
    }
    isStringSchema() {
        return this.getSchema() === SCHEMA.STRING;
    }
    isBooleanSchema() {
        return this.getSchema() === SCHEMA.BOOLEAN;
    }
    isNumericSchema() {
        return this.getSchema() === SCHEMA.NUMERIC;
    }
    isBigIntegerSchema() {
        return this.getSchema() === SCHEMA.BIG_INTEGER;
    }
    isBigDecimalSchema() {
        return this.getSchema() === SCHEMA.BIG_DECIMAL;
    }
    isStreaming() {
        const streaming = !!this.getMergedTraits().streaming;
        if (streaming) {
            return true;
        }
        return this.getSchema() === SCHEMA.STREAMING_BLOB;
    }
    getMergedTraits() {
        if (this.normalizedTraits) {
            return this.normalizedTraits;
        }
        this.normalizedTraits = {
            ...this.getOwnTraits(),
            ...this.getMemberTraits(),
        };
        return this.normalizedTraits;
    }
    getMemberTraits() {
        return NormalizedSchema.translateTraits(this.memberTraits);
    }
    getOwnTraits() {
        return NormalizedSchema.translateTraits(this.traits);
    }
    getKeySchema() {
        if (this.isDocumentSchema()) {
            return NormalizedSchema.memberFrom([SCHEMA.DOCUMENT, 0], "key");
        }
        if (!this.isMapSchema()) {
            throw new Error(`@smithy/core/schema - cannot get key schema for non-map schema: ${this.getName(true)}`);
        }
        const schema = this.getSchema();
        if (typeof schema === "number") {
            return NormalizedSchema.memberFrom([63 & schema, 0], "key");
        }
        return NormalizedSchema.memberFrom([schema.keySchema, 0], "key");
    }
    getValueSchema() {
        const schema = this.getSchema();
        if (typeof schema === "number") {
            if (this.isMapSchema()) {
                return NormalizedSchema.memberFrom([63 & schema, 0], "value");
            }
            else if (this.isListSchema()) {
                return NormalizedSchema.memberFrom([63 & schema, 0], "member");
            }
        }
        if (schema && typeof schema === "object") {
            if (this.isStructSchema()) {
                throw new Error(`cannot call getValueSchema() with StructureSchema ${this.getName(true)}`);
            }
            const collection = schema;
            if ("valueSchema" in collection) {
                if (this.isMapSchema()) {
                    return NormalizedSchema.memberFrom([collection.valueSchema, 0], "value");
                }
                else if (this.isListSchema()) {
                    return NormalizedSchema.memberFrom([collection.valueSchema, 0], "member");
                }
            }
        }
        if (this.isDocumentSchema()) {
            return NormalizedSchema.memberFrom([SCHEMA.DOCUMENT, 0], "value");
        }
        throw new Error(`@smithy/core/schema - the schema ${this.getName(true)} does not have a value member.`);
    }
    getMemberSchema(member) {
        if (this.isStructSchema()) {
            const struct = this.getSchema();
            if (!(member in struct.members)) {
                throw new Error(`@smithy/core/schema - the schema ${this.getName(true)} does not have a member with name=${member}.`);
            }
            return NormalizedSchema.memberFrom(struct.members[member], member);
        }
        if (this.isDocumentSchema()) {
            return NormalizedSchema.memberFrom([SCHEMA.DOCUMENT, 0], member);
        }
        throw new Error(`@smithy/core/schema - the schema ${this.getName(true)} does not have members.`);
    }
    getMemberSchemas() {
        const { schema } = this;
        const struct = schema;
        if (!struct || typeof struct !== "object") {
            return {};
        }
        if ("members" in struct) {
            const buffer = {};
            for (const member of struct.memberNames) {
                buffer[member] = this.getMemberSchema(member);
            }
            return buffer;
        }
        return {};
    }
    *structIterator() {
        if (this.isUnitSchema()) {
            return;
        }
        if (!this.isStructSchema()) {
            throw new Error("@smithy/core/schema - cannot acquire structIterator on non-struct schema.");
        }
        const struct = this.getSchema();
        for (let i = 0; i < struct.memberNames.length; ++i) {
            yield [struct.memberNames[i], NormalizedSchema.memberFrom([struct.memberList[i], 0], struct.memberNames[i])];
        }
    }
    getSchemaName() {
        const schema = this.getSchema();
        if (typeof schema === "number") {
            const _schema = 63 & schema;
            const container = 192 & schema;
            const type = Object.entries(SCHEMA).find(([, value]) => {
                return value === _schema;
            })?.[0] ?? "Unknown";
            switch (container) {
                case SCHEMA.MAP_MODIFIER:
                    return `${type}Map`;
                case SCHEMA.LIST_MODIFIER:
                    return `${type}List`;
                case 0:
                    return type;
            }
        }
        return "Unknown";
    }
}
NormalizedSchema.symbol = Symbol.for("@smithy/core/schema::NormalizedSchema");
